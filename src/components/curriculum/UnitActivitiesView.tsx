/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ContentStatus } from '../ContentStatus';
import { CURRICULUM_UNITS, UnitDefinition, ExerciseDefinition } from '../../data/unitsData';
import { CoordinateSystemExercise } from '../pilot/CoordinateSystemExercise';
import { AppUser, db, isUserAdmin } from '../../services/firebase';
import { doc, getDoc, setDoc } from '../../services/database';
import { loadCurriculumStatusMap } from '../../services/unitsCurriculumService';
import type { ActivityProgress } from '../../types/classStructure';
import {
  BookOpen,
  Layers,
  Compass,
  Code2,
  Sliders,
  Sparkles,
  Palette,
  CheckCircle,
  Check,
  RotateCcw,
  Play,
  ArrowRight,
  ArrowLeft,
  Save,
  FileText,
  Info,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Terminal,
  AlertTriangle,
} from 'lucide-react';

interface UnitActivitiesViewProps {
  onBackToHome: () => void;
  currentUser: AppUser | null;
  initialUnitId?: 'u1' | 'u2' | 'u3';
  initialExerciseId?: string;
  isStudentPreviewMode?: boolean;
  activityProgress?: Record<string, ActivityProgress>;
  onActivityResult?: (exerciseId: string, result: Omit<ActivityProgress, 'attempts' | 'lastAttemptAt'>) => void;
}

export const UnitActivitiesView: React.FC<UnitActivitiesViewProps> = ({
  onBackToHome,
  currentUser,
  initialUnitId = 'u1',
  initialExerciseId,
  isStudentPreviewMode = false,
  activityProgress,
  onActivityResult,
}) => {
  const [statusMap, setStatusMap] = useState<Record<string, 'draft' | 'published'>>({});
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusAttempt, setStatusAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setStatusError(null);
    loadCurriculumStatusMap().then((map) => { if (mounted) setStatusMap(map); })
      .catch(() => { if (mounted) setStatusError('No se pudo cargar la publicación de las actividades.'); });
    return () => { mounted = false; };
  }, [statusAttempt]);

  const isAdminOrPreview = isUserAdmin(currentUser) || isStudentPreviewMode;
  const [activeUnitId, setActiveUnitId] = useState<'u1' | 'u2' | 'u3'>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('u2') || hash.includes('unidad-2')) return 'u2';
      if (hash.includes('u3') || hash.includes('unidad-3')) return 'u3';
      const saved = localStorage.getItem('curriculum_active_unit');
      if (saved === 'u1' || saved === 'u2' || saved === 'u3') return saved;
    } catch {
      // Ignore
    }
    return initialUnitId;
  });

  const activeUnit = CURRICULUM_UNITS.find((u) => u.id === activeUnitId) || CURRICULUM_UNITS[0];

  const [activeExerciseId, setActiveExerciseId] = useState<string>(() => {
    try {
      if (initialExerciseId) return initialExerciseId;
      const hash = window.location.hash.toLowerCase();
      const match = hash.match(/u[1-3]-e[1-6]/);
      if (match) return match[0];
      const saved = localStorage.getItem(`curriculum_active_ex_${activeUnit.id}`);
      if (saved) return saved;
    } catch {
      // Ignore
    }
    return activeUnit.exercises[0].id;
  });

  // Keep activeExerciseId in sync when unit changes
  useEffect(() => {
    if (!activeUnit.exercises.some((e) => e.id === activeExerciseId)) {
      setActiveExerciseId(activeUnit.exercises[0].id);
    }
  }, [activeUnit, activeExerciseId]);

  const activeExercise =
    activeUnit.exercises.find((e) => e.id === activeExerciseId) || activeUnit.exercises[0];

  // Student interaction states
  const [studentCode, setStudentCode] = useState<string>(activeExercise.defaultProcessingCode);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [studentReflection, setStudentReflection] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync editor code when exercise changes
  useEffect(() => {
    setStudentCode(activeExercise.defaultProcessingCode);
    setSelectedOptionId(null);
    setShowFeedback(false);
    setSaveStatus(null);

    // Try loading saved evidence from localStorage
    try {
      const savedEv = localStorage.getItem(`curriculum_ev_${activeExercise.id}`);
      if (savedEv) {
        const parsed = JSON.parse(savedEv);
        if (parsed.code) setStudentCode(parsed.code);
        if (parsed.optionId) {
          setSelectedOptionId(parsed.optionId);
          setShowFeedback(true);
        }
        if (parsed.reflection) setStudentReflection(parsed.reflection);
      } else {
        setStudentReflection('');
      }
    } catch {
      // Ignore
    }
  }, [activeExercise.id, activeExercise.defaultProcessingCode]);

  // Load cloud evidence if logged in
  useEffect(() => {
    if (!currentUser) return;
    const loadEv = async () => {
      try {
        const ref = doc(db, 'users', currentUser.uid, 'curriculum_evidences', activeExercise.id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.code) setStudentCode(data.code);
          if (data.optionId) {
            setSelectedOptionId(data.optionId);
            setShowFeedback(true);
          }
          if (data.reflection) setStudentReflection(data.reflection);
        }
      } catch (err) {
        // Non-fatal
      }
    };
    loadEv();
  }, [currentUser, activeExercise.id]);

  // =========================================================================
  // INTERACTIVE VISUAL EXPERIMENTS FOR SPECIFIC EXERCISES
  // =========================================================================
  // U1-E1: Interactive Layer Order
  const [u1e1Order, setU1e1Order] = useState<'circle-first' | 'rect-first'>('circle-first');

  // U1-E2: Parameter variation step
  const [u1e2Step, setU1e2Step] = useState<number>(25);

  // U2-E5: Color lab RGB and HSB values
  const [rgbR, setRgbR] = useState<number>(40);
  const [rgbG, setRgbG] = useState<number>(123);
  const [rgbB, setRgbB] = useState<number>(93);

  const [hsbH, setHsbH] = useState<number>(158);
  const [hsbS, setHsbS] = useState<number>(67);
  const [hsbB, setHsbB] = useState<number>(48);

  // U3-E1: Reusable variable slider
  const [u3e1Radio, setU3e1Radio] = useState<number>(80);

  // U3-E2: Responsive window size slider
  const [u3e2Width, setU3e2Width] = useState<number>(400);

  // U3-E4: Arithmetic proportional base
  const [u3e4Base, setU3e4Base] = useState<number>(50);

  // U3-E5: Frame animator for incrementation
  const [u3e5X, setU3e5X] = useState<number>(50);
  const [u3e5Speed, setU3e5Speed] = useState<number>(3);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw Interactive Visual according to active exercise
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 400;
    const h = 260;
    ctx.clearRect(0, 0, w, h);

    // Default background
    ctx.fillStyle = '#FAF9F5';
    ctx.fillRect(0, 0, w, h);

    // 1. U1-E1: Layer Ordering
    if (activeExercise.id === 'u1-e1') {
      if (u1e1Order === 'circle-first') {
        // Círculo primero (abajo)
        ctx.fillStyle = '#407B5D';
        ctx.beginPath();
        ctx.arc(200, 130, 80, 0, Math.PI * 2);
        ctx.fill();

        // Rectángulo después (arriba)
        ctx.fillStyle = '#2868D9';
        ctx.fillRect(140, 70, 120, 120);
      } else {
        // Rectángulo primero (abajo)
        ctx.fillStyle = '#2868D9';
        ctx.fillRect(140, 70, 120, 120);

        // Círculo después (arriba)
        ctx.fillStyle = '#407B5D';
        ctx.beginPath();
        ctx.arc(200, 130, 80, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. U1-E2: Rule Variations
    else if (activeExercise.id === 'u1-e2') {
      ctx.strokeStyle = '#407B5D';
      ctx.lineWidth = 2.5;
      for (let r = 20; r <= 110; r += u1e2Step) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#141414';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`Paso de radio: ${u1e2Step}px`, 15, 245);
    }

    // 3. U1-E3: Procedural Poster
    else if (activeExercise.id === 'u1-e3') {
      ctx.fillStyle = '#1C1C1E';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#3A3A3C';
      ctx.lineWidth = 1;
      for (let x = 30; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, h - 20);
        ctx.stroke();
      }
      ctx.fillStyle = '#D9AA3D';
      ctx.beginPath();
      ctx.arc(w / 2, 95, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FAF9F5';
      ctx.font = 'bold 14px IBM Plex Mono, monospace';
      ctx.fillText('PROCEDIMIENTO DE DISEÑO', 30, h - 40);
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillStyle = '#8E8E89';
      ctx.fillText('Regla paramétrica: Retícula + Foco áureo', 30, h - 22);
    }

    // 4. U2-E1: Processing IDE Preview
    else if (activeExercise.id === 'u2-e1') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, w, h);
      // Sketch window titlebar
      ctx.fillStyle = '#2A2A2E';
      ctx.fillRect(30, 25, 340, 22);
      ctx.fillStyle = '#FAF9F5';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText('Sketch_01 · Processing Java [En Ejecución]', 40, 40);
      // Window viewport
      ctx.fillStyle = '#FAF9F5';
      ctx.fillRect(30, 47, 340, 180);
      ctx.fillStyle = '#407B5D';
      ctx.fillRect(70, 75, 260, 120);
      ctx.fillStyle = '#141414';
      ctx.font = 'bold 11px IBM Plex Mono, monospace';
      ctx.fillText('size(500, 350); rect(100, 80, 300, 180);', 75, 140);
    }

    // 5. U2-E3: Function Anatomy Callouts
    else if (activeExercise.id === 'u2-e3') {
      ctx.fillStyle = '#FAF9F5';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(64, 123, 93, 0.2)';
      ctx.strokeStyle = '#407B5D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(200, 130, 100, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Measurement guides
      ctx.strokeStyle = '#2868D9';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(100, 130);
      ctx.lineTo(300, 130);
      ctx.stroke();

      ctx.strokeStyle = '#D34E43';
      ctx.beginPath();
      ctx.moveTo(200, 80);
      ctx.lineTo(200, 180);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 10px IBM Plex Mono, monospace';
      ctx.fillStyle = '#2868D9';
      ctx.fillText('3er arg: ancho = 200px', 130, 70);
      ctx.fillStyle = '#D34E43';
      ctx.fillText('4to arg: alto = 100px', 215, 175);
    }

    // 6. U2-E4: 2D Primitives composition
    else if (activeExercise.id === 'u2-e4') {
      // Composition with 3 primitives
      ctx.strokeStyle = '#303030';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 40, 120, 120);

      ctx.fillStyle = '#2868D9';
      ctx.beginPath();
      ctx.arc(240, 150, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#D9AA3D';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(40, 220);
      ctx.lineTo(360, 40);
      ctx.stroke();
    }

    // 7. U2-E5: Color RGB vs HSB swatches
    else if (activeExercise.id === 'u2-e5') {
      // Swatch 1: RGB
      ctx.fillStyle = `rgb(${rgbR}, ${rgbG}, ${rgbB})`;
      ctx.fillRect(40, 40, 140, 140);
      ctx.strokeRect(40, 40, 140, 140);

      ctx.fillStyle = '#141414';
      ctx.font = 'bold 11px IBM Plex Mono, monospace';
      ctx.fillText('Color RGB', 40, 200);
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`R:${rgbR} G:${rgbG} B:${rgbB}`, 40, 218);

      // Swatch 2: HSB
      ctx.fillStyle = `hsl(${hsbH}, ${hsbS}%, ${hsbB}%)`;
      ctx.fillRect(220, 40, 140, 140);
      ctx.strokeRect(220, 40, 140, 140);

      ctx.fillStyle = '#141414';
      ctx.font = 'bold 11px IBM Plex Mono, monospace';
      ctx.fillText('Color HSB / HSL', 220, 200);
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`H:${hsbH}° S:${hsbS}% B:${hsbB}%`, 220, 218);
    }

    // 8. U2-E6: Reference Lookup
    else if (activeExercise.id === 'u2-e6') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(20, 20, w - 40, h - 40);
      ctx.strokeStyle = '#DEDDD7';
      ctx.strokeRect(20, 20, w - 40, h - 40);

      ctx.fillStyle = '#2868D9';
      ctx.font = 'bold 12px IBM Plex Mono, monospace';
      ctx.fillText('Referencia oficial: arc()', 40, 50);

      ctx.fillStyle = '#626262';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText('Sintaxis: arc(a, b, c, d, start, stop)', 40, 72);
      ctx.fillText('Parámetros: float coordenadas y ángulos en radianes', 40, 90);

      // Arc graphic demo
      ctx.fillStyle = '#D9AA3D';
      ctx.beginPath();
      ctx.moveTo(200, 170);
      ctx.arc(200, 170, 50, 0, Math.PI * 1.5);
      ctx.closePath();
      ctx.fill();
    }

    // 9. U3-E1: Reusable variable demo
    else if (activeExercise.id === 'u3-e1') {
      ctx.fillStyle = '#407B5D';
      ctx.beginPath();
      ctx.arc(80, 130, u3e1Radio / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(200, 130, u3e1Radio / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(320, 130, u3e1Radio / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#141414';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`float radio = ${u3e1Radio}; (Gobierna las 3 formas a la vez)`, 30, 240);
    }

    // 10. U3-E2: Adaptive window size demo
    else if (activeExercise.id === 'u3-e2') {
      const simW = u3e2Width;
      const simH = 180;
      ctx.fillStyle = '#E8EEE8';
      ctx.fillRect(20, 30, simW - 40, simH);
      ctx.strokeStyle = '#407B5D';
      ctx.strokeRect(20, 30, simW - 40, simH);

      // Center figure using width/2
      ctx.fillStyle = '#2868D9';
      ctx.beginPath();
      ctx.arc(20 + (simW - 40) / 2, 30 + simH / 2, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#141414';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`Lienzo: width=${simW} | Centro automático: width/2`, 25, 235);
    }

    // 11. U3-E3: Parameter system
    else if (activeExercise.id === 'u3-e3') {
      ctx.fillStyle = '#2868D9';
      const count = 4;
      const mod = 45;
      for (let i = 0; i < count; i++) {
        ctx.fillRect(45 + i * (mod + 25), 90, mod, mod);
      }
      ctx.fillStyle = '#141414';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText('Sistema paramétrico: columnas=4, tamanoModulo=45', 40, 220);
    }

    // 12. U3-E4: Arithmetic proportional relations
    else if (activeExercise.id === 'u3-e4') {
      ctx.fillStyle = '#407B5D';
      ctx.beginPath();
      ctx.arc(80, 130, u3e4Base / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2868D9';
      ctx.beginPath();
      ctx.arc(200, 130, (u3e4Base * 1.5) / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#D9AA3D';
      ctx.beginPath();
      ctx.arc(320, 130, (u3e4Base * 0.5) / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#141414';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`Base: ${u3e4Base}px | 1.5x: ${u3e4Base * 1.5}px | 0.5x: ${u3e4Base * 0.5}px`, 40, 240);
    }

    // 13. U3-E5: Incrementation animation frame
    else if (activeExercise.id === 'u3-e5') {
      ctx.fillStyle = '#407B5D';
      ctx.beginPath();
      ctx.arc(u3e5X, 130, 25, 0, Math.PI * 2);
      ctx.fill();

      // Motion trail
      ctx.fillStyle = 'rgba(64, 123, 93, 0.2)';
      ctx.beginPath();
      ctx.arc(u3e5X - u3e5Speed * 4, 130, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#141414';
      ctx.font = '10px IBM Plex Mono, monospace';
      ctx.fillText(`x = ${Math.round(u3e5X)}px | velocidad = ${u3e5Speed} px/frame`, 30, 240);
    }
  }, [
    statusMap, statusError,
    activeExercise.id,
    u1e1Order,
    u1e2Step,
    rgbR,
    rgbG,
    rgbB,
    hsbH,
    hsbS,
    hsbB,
    u3e1Radio,
    u3e2Width,
    u3e4Base,
    u3e5X,
    u3e5Speed,
  ]);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    setShowFeedback(true);
  };

  const handleSaveEvidence = async () => {
    setSaveStatus('Guardando...');
    const chosen = activeExercise.interpretationOptions.find((o) => o.id === selectedOptionId);
    const evidenceData = {
      exerciseId: activeExercise.id,
      unitId: activeUnit.id,
      code: studentCode,
      optionId: selectedOptionId,
      predictionCorrect: chosen?.isCorrect ?? false,
      reflection: studentReflection,
      completed: Boolean(chosen?.isCorrect) && studentReflection.trim().length > 10,
      updatedAt: new Date().toISOString(),
      userEmail: currentUser?.email || 'Estudiante',
      userName: currentUser?.displayName || 'Estudiante',
    };

    try {
      const passed = evidenceData.completed;
      onActivityResult?.(activeExercise.id, {
        unitId: activeUnit.id,
        passed,
        bestScore: passed ? 100 : chosen ? 50 : 0,
        lastFeedback: chosen?.feedback || 'Selecciona una respuesta y escribe una reflexión para completar la actividad.',
      });
      localStorage.setItem(`curriculum_ev_${activeExercise.id}`, JSON.stringify(evidenceData));
      if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid, 'curriculum_evidences', activeExercise.id);
        await setDoc(ref, evidenceData, { merge: true });
      }
      setSaveStatus('¡Evidencia guardada exitosamente!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch {
      setSaveStatus('Guardado en caché local.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const currentActivityProgress = activityProgress?.[activeExercise.id];

  const currentExIdx = activeUnit.exercises.findIndex((e) => e.id === activeExercise.id);
  const prevExercise = currentExIdx > 0 ? activeUnit.exercises[currentExIdx - 1] : null;
  const nextExercise =
    currentExIdx < activeUnit.exercises.length - 1 ? activeUnit.exercises[currentExIdx + 1] : null;

  if (!Object.keys(statusMap).length || statusError) return <ContentStatus error={statusError} onRetry={() => setStatusAttempt((attempt) => attempt + 1)} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDDD7] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] rounded-xl text-[#626262] hover:text-[#141414] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Inicio</span>
          </button>
          <div className="h-4 w-px bg-[#DEDDD7]" />
          <div>
            <span className="text-[10px] font-bold font-mono uppercase text-[#407B5D] block">
              PLAN DE ESTUDIOS · UNIDADES Y ACTIVIDADES
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] tracking-tight">
              {activeUnit.title}
            </h1>
          </div>
        </div>

        {/* Unit Selector Tabs */}
        <div className="flex items-center gap-1.5 border border-[#DEDDD7] bg-white p-1 rounded-2xl text-xs font-mono">
          {CURRICULUM_UNITS.map((u) => {
            const isActive = u.id === activeUnitId;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setActiveUnitId(u.id);
                  try {
                    localStorage.setItem('curriculum_active_unit', u.id);
                  } catch {}
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#407B5D] text-white shadow-xs'
                    : 'text-[#626262] hover:bg-[#FAF9F5]'
                }`}
              >
                Unidad {u.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit Purpose Banner */}
      <div className="p-4 sm:p-5 bg-white border border-[#DEDDD7] rounded-2xl space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-[#407B5D] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#D9AA3D]" />
          <span>PROPÓSITO DE LA UNIDAD {activeUnit.number}:</span>
        </div>
        <p className="text-xs sm:text-sm text-[#141414] font-medium leading-relaxed">
          {activeUnit.purpose}
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-[#626262]">
          <span className="text-[#8E8E89]">Contenidos:</span>
          {activeUnit.contents.map((c, i) => (
            <span key={i} className="bg-[#FAF9F5] border border-[#DEDDD7] px-2 py-0.5 rounded">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Exercises Selector Bar */}
      <div className="space-y-2">
        <span className="text-xs font-bold font-mono text-[#8E8E89] uppercase tracking-wider block">
          Actividades de la Unidad {activeUnit.number} ({activeUnit.exercises.length} actividades):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
          {activeUnit.exercises.map((ex) => {
            const isCurrent = ex.id === activeExerciseId;
            const exStatus = statusMap[ex.id] || ex.status;
            const isPub = exStatus === 'published' || ex.inventoryStatus === 'ya_existia';

            return (
              <button
                key={ex.id}
                onClick={() => {
                  setActiveExerciseId(ex.id);
                  try {
                    localStorage.setItem(`curriculum_active_ex_${activeUnit.id}`, ex.id);
                    window.location.hash = `#${ex.id}`;
                  } catch {}
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                  isCurrent
                    ? 'border-[#2868D9] bg-white shadow-xs ring-2 ring-[#2868D9]/20 font-bold'
                    : 'border-[#DEDDD7] bg-white hover:bg-[#FAF9F5] text-[#626262]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPub ? 'bg-[#407B5D]' : 'bg-[#D9AA3D]'
                      }`}
                      title={isPub ? 'Publicado' : 'Borrador'}
                    />
                    <span className={isCurrent ? 'text-[#2868D9]' : 'text-[#8E8E89]'}>{ex.code}</span>
                  </div>
                  {ex.badge && (
                    <span className="text-[9px] bg-[#E8EEE8] text-[#407B5D] px-1.5 py-0.2 rounded font-bold">
                      {ex.badge.slice(0, 10)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] line-clamp-1 text-[#141414] font-sans">
                  {ex.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DRAFT BLOCKED NOTICE FOR REGULAR STUDENTS */}
      {(() => {
        const activeStatus = statusMap[activeExercise.id] || activeExercise.status;
        const isDraftBlocked =
          activeStatus === 'draft' && !isAdminOrPreview && activeExercise.inventoryStatus !== 'ya_existia';

        if (isDraftBlocked) {
          return (
            <div className="p-8 sm:p-12 bg-white border border-[#E1E7E1] rounded-3xl text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF9EE] text-[#8A6318] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <span className="font-mono text-xs font-bold text-[#8A6318] bg-[#FFF2D6] px-2.5 py-0.5 rounded-full">
                  {activeExercise.code} · Borrador para Revisión Docente
                </span>
                <h3 className="text-xl font-bold text-[#232A24] pt-2">
                  {activeExercise.title}
                </h3>
                <p className="text-xs text-[#59645C] leading-relaxed">
                  Esta actividad ha sido formulada en la plataforma como propuesta pedagógica en estado <strong>Borrador</strong> para revisión y aprobación del profesorado. Estará disponible para el estudiantado una vez publicada desde el CMS.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    setActiveUnitId('u2');
                    setActiveExerciseId('u2-e2');
                    window.location.hash = '#u2-e2';
                  }}
                  className="px-4 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Ir a Actividad Publicada: U2·02 Coordenadas
                </button>
                <button
                  onClick={onBackToHome}
                  className="px-4 py-2.5 border border-[#E1E7E1] bg-white rounded-xl text-xs font-semibold text-[#232A24] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          );
        }

        return activeExercise.id === 'u2-e2' ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#E8EEE8] border border-[#A4C4B5] rounded-2xl text-xs text-[#232A24] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#407B5D] shrink-0" />
              <span>
                <strong>Actividad U2·02 Protegida:</strong> Este ejercicio reutiliza íntegramente el sistema interactivo de retícula cartesiana, origen (0,0) y metodología de 5 etapas sin duplicación.
              </span>
            </div>
            <CoordinateSystemExercise />
          </div>
        ) : (
          /* STANDARD 4-PHASE EXERCISE WORKSPACE */
          <div className="space-y-6">
            {/* If in teacher/preview mode and exercise is draft, show notice banner */}
            {activeStatus === 'draft' && isAdminOrPreview && (
              <div className="p-3 bg-[#FFF9EE] border border-[#E6C687] text-[#8A6318] rounded-2xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#8A6318]" />
                  <span>
                    <strong>Modo Docente / Vista Previa:</strong> Esta actividad ({activeExercise.code}) se encuentra en estado <strong>Borrador</strong> (oculta a estudiantes regulares).
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#8A6318] text-white px-2 py-0.5 rounded-full">
                  BORRADOR
                </span>
              </div>
            )}

            {/* Header of Active Exercise */}
            <div className="bg-white border border-[#DEDDD7] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DEDDD7] pb-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold bg-[#E8EEE8] text-[#407B5D] px-2.5 py-0.5 rounded">
                    {activeExercise.code}
                  </span>
                  <span className="text-[#8E8E89]">·</span>
                  <span className="text-[#626262] font-sans font-bold">{activeExercise.subtitle}</span>
                </div>
                <span className="text-xs font-mono text-[#8E8E89]">
                  Tiempo estimado: {activeExercise.estimatedTime || '25 min'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#141414] tracking-tight">
              {activeExercise.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                currentActivityProgress?.passed
                  ? 'bg-[#E8EEE8] text-[#407B5D]'
                  : currentActivityProgress
                    ? 'bg-[#FFF5D9] text-[#8A6318]'
                    : 'bg-[#F7F8F4] text-[#626262]'
              }`}>
                {currentActivityProgress?.passed ? 'Aprobada' : currentActivityProgress ? 'Intentada' : 'Sin intento'}
              </span>
              {currentActivityProgress && (
                <span className="text-[#626262]">
                  {currentActivityProgress.attempts} {currentActivityProgress.attempts === 1 ? 'intento' : 'intentos'} · mejor resultado {currentActivityProgress.bestScore}%
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#626262] leading-relaxed">
              <strong>Objetivo:</strong> {activeExercise.objective}
            </p>

            {/* Split layout: Phase 1 (Visual Start & Interactive Canvas) + Phase 2 (Code & Tasks) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-start">
              {/* LEFT: Visual Start & Interactive Simulation (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 bg-[#FAF9F5] border border-[#DEDDD7] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#2868D9]">
                      1. INICIO VISUAL & MANIPULACIÓN
                    </span>
                  </div>

                  <p className="text-xs text-[#626262] leading-relaxed">
                    {activeExercise.visualStartDescription}
                  </p>

                  {/* Rendered HTML5 Canvas */}
                  <div className="border border-[#DEDDD7] rounded-xl overflow-hidden flex justify-center bg-white shadow-2xs">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={260}
                      className="w-full max-w-[400px] h-auto block"
                    />
                  </div>

                  {/* Exercise-specific interactive controls */}
                  <div className="p-3 bg-white border border-[#DEDDD7] rounded-xl space-y-2 text-xs font-mono">
                    <span className="text-[#8E8E89] block text-[10px] font-bold">
                      CONTROLES DE MANIPULACIÓN EN VIVO:
                    </span>

                    {activeExercise.id === 'u1-e1' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setU1e1Order('circle-first')}
                          className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                            u1e1Order === 'circle-first'
                              ? 'bg-[#407B5D] text-white border-[#407B5D]'
                              : 'border-[#DEDDD7] text-[#626262]'
                          }`}
                        >
                          Círculo primero → Rectángulo encima
                        </button>
                        <button
                          onClick={() => setU1e1Order('rect-first')}
                          className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                            u1e1Order === 'rect-first'
                              ? 'bg-[#2868D9] text-white border-[#2868D9]'
                              : 'border-[#DEDDD7] text-[#626262]'
                          }`}
                        >
                          Rectángulo primero → Círculo encima
                        </button>
                      </div>
                    )}

                    {activeExercise.id === 'u1-e2' && (
                      <div className="space-y-1">
                        <label className="flex justify-between text-[11px] text-[#626262]">
                          <span>Variar espaciado entre círculos:</span>
                          <span className="font-bold">{u1e2Step} px</span>
                        </label>
                        <input
                          type="range"
                          min={10}
                          max={45}
                          value={u1e2Step}
                          onChange={(e) => setU1e2Step(Number(e.target.value))}
                          className="w-full accent-[#407B5D]"
                        />
                      </div>
                    )}

                    {activeExercise.id === 'u2-e5' && (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="flex justify-between text-[10px] text-[#626262]">
                            <span>RGB Rojo (0-255):</span> <span>{rgbR}</span>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={255}
                            value={rgbR}
                            onChange={(e) => setRgbR(Number(e.target.value))}
                            className="w-full accent-red-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="flex justify-between text-[10px] text-[#626262]">
                            <span>HSB Matiz (0-360°):</span> <span>{hsbH}°</span>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={360}
                            value={hsbH}
                            onChange={(e) => setHsbH(Number(e.target.value))}
                            className="w-full accent-[#2868D9]"
                          />
                        </div>
                      </div>
                    )}

                    {activeExercise.id === 'u3-e1' && (
                      <div className="space-y-1">
                        <label className="flex justify-between text-[11px] text-[#626262]">
                          <span>Variable común float radio:</span>
                          <span className="font-bold">{u3e1Radio} px</span>
                        </label>
                        <input
                          type="range"
                          min={30}
                          max={120}
                          value={u3e1Radio}
                          onChange={(e) => setU3e1Radio(Number(e.target.value))}
                          className="w-full accent-[#407B5D]"
                        />
                      </div>
                    )}

                    {activeExercise.id === 'u3-e2' && (
                      <div className="space-y-1">
                        <label className="flex justify-between text-[11px] text-[#626262]">
                          <span>Simular cambio de tamaño size(width):</span>
                          <span className="font-bold">{u3e2Width} px</span>
                        </label>
                        <input
                          type="range"
                          min={240}
                          max={390}
                          value={u3e2Width}
                          onChange={(e) => setU3e2Width(Number(e.target.value))}
                          className="w-full accent-[#2868D9]"
                        />
                      </div>
                    )}

                    {activeExercise.id === 'u3-e4' && (
                      <div className="space-y-1">
                        <label className="flex justify-between text-[11px] text-[#626262]">
                          <span>Variable base de escala:</span>
                          <span className="font-bold">{u3e4Base} px</span>
                        </label>
                        <input
                          type="range"
                          min={25}
                          max={85}
                          value={u3e4Base}
                          onChange={(e) => setU3e4Base(Number(e.target.value))}
                          className="w-full accent-[#407B5D]"
                        />
                      </div>
                    )}

                    {activeExercise.id === 'u3-e5' && (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setU3e5X((prev) => (prev + u3e5Speed > 380 ? 20 : prev + u3e5Speed * 6));
                          }}
                          className="px-3 py-1 bg-[#407B5D] text-white rounded-lg flex items-center gap-1 cursor-pointer font-bold text-xs"
                        >
                          <Play className="w-3 h-3" /> Avanzar fotograma (+{u3e5Speed}px)
                        </button>
                        <button
                          onClick={() => setU3e5Speed((prev) => -prev)}
                          className="px-2.5 py-1 border border-[#DEDDD7] rounded-lg text-xs cursor-pointer hover:bg-[#FAF9F5]"
                        >
                          Invertir signo ({u3e5Speed > 0 ? '+3 → -3' : '-3 → +3'})
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Scope Callout */}
                <div className="p-3.5 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#141414] font-mono block">
                    Alcance Técnico:
                  </span>
                  <p className="text-[#626262] leading-relaxed">{activeExercise.technicalScope}</p>
                </div>
              </div>

              {/* RIGHT: Activity Code & Practice (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 bg-[#FAF9F5] border border-[#DEDDD7] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#407B5D]">
                      2. ACTIVIDAD & CÓDIGO PROCESSING JAVA
                    </span>
                    <button
                      onClick={() => setStudentCode(activeExercise.defaultProcessingCode)}
                      className="text-[11px] text-[#8E8E89] hover:text-[#141414] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar plantilla
                    </button>
                  </div>

                  <p className="text-xs text-[#626262] leading-relaxed">
                    {activeExercise.activityDescription}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#8E8E89]">Sketch.pde</span>
                    <textarea
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      rows={10}
                      className="w-full p-3 font-mono text-xs bg-[#141414] text-[#FAF9F5] border border-[#232A24] rounded-xl focus:outline-none focus:border-[#2868D9] leading-relaxed resize-y"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Achievement Criteria Box */}
                <div className="p-3.5 bg-[#E8EEE8] border border-[#A4C4B5] rounded-xl text-xs space-y-1 text-[#232A24]">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#407B5D]" /> Criterio de Logro:
                  </span>
                  <p className="text-[#33654C] leading-relaxed">
                    {activeExercise.achievementCriteria}
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3: Interpretation Question with Reasoned Feedback */}
            <div className="p-5 bg-[#FAF9F5] border border-[#DEDDD7] rounded-2xl space-y-4 pt-4 border-t border-[#DEDDD7]">
              <div className="space-y-1">
                <span className="text-xs font-bold font-mono text-[#D9AA3D]">
                  3. PREGUNTA DE INTERPRETACIÓN
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#141414]">
                  {activeExercise.interpretationQuestion}
                </p>
              </div>

              <div className="space-y-2">
                {activeExercise.interpretationOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-sans transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? 'border-[#407B5D] bg-[#E8EEE8] text-[#141414]'
                            : 'border-[#D34E43] bg-[#FDF2F2] text-[#141414]'
                          : 'border-[#DEDDD7] bg-white hover:bg-[#FAF9F5] text-[#626262]'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center text-[10px] ${
                          isSelected
                            ? opt.isCorrect
                              ? 'bg-[#407B5D] text-white border-[#407B5D]'
                              : 'bg-[#D34E43] text-white border-[#D34E43]'
                            : 'border-[#A4A4A0]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showFeedback && selectedOptionId && (
                <div className="p-3 bg-white border border-[#DEDDD7] rounded-xl text-xs text-[#141414] flex items-start gap-2 shadow-2xs">
                  <Info className="w-4 h-4 text-[#2868D9] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {
                      activeExercise.interpretationOptions.find((o) => o.id === selectedOptionId)
                        ?.feedback
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Phase 4: Evidence Documentation & Submission */}
            <div className="p-5 bg-white border border-[#DEDDD7] rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold font-mono text-[#2868D9]">
                  4. REGISTRO DE EVIDENCIA
                </span>
                <p className="text-xs text-[#626262]">
                  <strong>Requerimiento:</strong> {activeExercise.evidenceRequirement}
                </p>
              </div>

              <textarea
                value={studentReflection}
                onChange={(e) => setStudentReflection(e.target.value)}
                placeholder="Escribe aquí tu análisis o justificación según la consigna de la actividad..."
                rows={4}
                className="w-full p-3.5 border border-[#DEDDD7] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#2868D9] leading-relaxed resize-y"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSaveEvidence}
                  className="px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Evidencia</span>
                </button>

                {saveStatus && (
                  <span className="text-xs font-mono font-bold text-[#407B5D]">
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation footer between exercises */}
            <div className="flex items-center justify-between pt-4 border-t border-[#DEDDD7]">
              {prevExercise ? (
                <button
                  onClick={() => {
                    setActiveExerciseId(prevExercise.id);
                    window.location.hash = `#${prevExercise.id}`;
                  }}
                  className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior: {prevExercise.code}</span>
                </button>
              ) : <div />}

              {nextExercise ? (
                <button
                  onClick={() => {
                    setActiveExerciseId(nextExercise.id);
                    window.location.hash = `#${nextExercise.id}`;
                  }}
                  className="px-5 py-2.5 bg-[#2868D9] hover:bg-[#1f54b3] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
                >
                  <span>Siguiente: {nextExercise.code}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onBackToHome}
                  className="px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
                >
                  <span>Finalizar Unidad {activeUnit.number}</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })()}
  </div>
);
};
