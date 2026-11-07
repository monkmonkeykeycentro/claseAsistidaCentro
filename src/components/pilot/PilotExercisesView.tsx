/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CoordinateSystemExercise } from './CoordinateSystemExercise';
import { ConditionalDecisionsExercise } from './ConditionalDecisionsExercise';
import { VideoAsciiSplitCanvas } from '../generative/VideoAsciiSplitCanvas';
import {
  CoordinateEvidence,
  ConditionalEvidence,
  PilotExerciseConfig,
} from '../../types/pilotExercises';
import { AppUser, db } from '../../services/firebase';
import { doc, getDoc, setDoc } from '../../services/database';
import {
  Compass,
  SplitSquareVertical,
  Film,
  ArrowLeft,
  BookOpen,
  Check,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PilotExercisesViewProps {
  onBackToHome: () => void;
  currentUser: AppUser | null;
  configs?: Record<string, PilotExerciseConfig>;
}

export const PilotExercisesView: React.FC<PilotExercisesViewProps> = ({
  onBackToHome,
  currentUser,
  configs,
}) => {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('condicionales') || hash.includes('ejercicio-2')) return 1;
      if (hash.includes('audiovisual') || hash.includes('ejercicio-3')) return 2;
      const saved = localStorage.getItem('pilot_active_exercise_index');
      if (saved) return Number(saved);
    } catch {
      // Ignore
    }
    return 0;
  });

  // Local evidence cache
  const [coordEvidence, setCoordEvidence] = useState<Partial<CoordinateEvidence>>(() => {
    try {
      const saved = localStorage.getItem('pilot_coordinate_evidence');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {};
  });

  const [condEvidence, setCondEvidence] = useState<Partial<ConditionalEvidence>>(() => {
    try {
      const saved = localStorage.getItem('pilot_conditional_evidence');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {};
  });

  // Fetch persisted evidence if logged in
  useEffect(() => {
    if (!currentUser) return;
    const loadCloudEvidences = async () => {
      try {
        const coordDoc = await getDoc(
          doc(db, 'users', currentUser.uid, 'pilot_evidences', 'coordinates')
        );
        if (coordDoc.exists()) {
          setCoordEvidence(coordDoc.data() as CoordinateEvidence);
        }

        const condDoc = await getDoc(
          doc(db, 'users', currentUser.uid, 'pilot_evidences', 'conditionals')
        );
        if (condDoc.exists()) {
          setCondEvidence(condDoc.data() as ConditionalEvidence);
        }
      } catch (err) {
        console.warn('Could not load pilot evidences from cloud:', err);
      }
    };
    loadCloudEvidences();
  }, [currentUser]);

  const handleSaveCoordinateEvidence = async (evidence: CoordinateEvidence) => {
    setCoordEvidence(evidence);
    try {
      localStorage.setItem('pilot_coordinate_evidence', JSON.stringify(evidence));
      if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid, 'pilot_evidences', 'coordinates');
        await setDoc(ref, {
          ...evidence,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          userName: currentUser.displayName,
          submittedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Error saving coordinate evidence:', err);
    }
  };

  const handleSaveConditionalEvidence = async (evidence: ConditionalEvidence) => {
    setCondEvidence(evidence);
    try {
      localStorage.setItem('pilot_conditional_evidence', JSON.stringify(evidence));
      if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid, 'pilot_evidences', 'conditionals');
        await setDoc(ref, {
          ...evidence,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          userName: currentUser.displayName,
          submittedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Error saving conditional evidence:', err);
    }
  };

  const handleSelectExercise = (idx: number) => {
    setActiveExerciseIndex(idx);
    try {
      localStorage.setItem('pilot_active_exercise_index', String(idx));
      const hashName = idx === 0 ? '#coordenadas' : idx === 1 ? '#condicionales' : '#audiovisual';
      window.history.replaceState(null, '', hashName);
    } catch {
      // Ignore
    }
  };

  const exercises = [
    {
      id: 'coordinates' as const,
      number: '01',
      title: configs?.coordinates?.title || 'Sistemas de coordenadas',
      subtitle: configs?.coordinates?.subtitle || 'Del espacio a la forma',
      badge: 'Metodología 5 Etapas',
      icon: Compass,
      isCompleted: Boolean(coordEvidence.completed),
    },
    {
      id: 'conditionals' as const,
      number: '02',
      title: configs?.conditionals?.title || 'Estructuras condicionales',
      subtitle: configs?.conditionals?.subtitle || 'Decisiones visuales',
      badge: 'Metodología 5 Etapas',
      icon: SplitSquareVertical,
      isCompleted: Boolean(condEvidence.completed),
    },
    {
      id: 'audiovisual' as const,
      number: '03',
      title: configs?.audiovisual?.title || 'Ejercicio audiovisual existente',
      subtitle: configs?.audiovisual?.subtitle || 'Discretización de Video a Caracteres ASCII',
      badge: 'Instalación Interactiva',
      icon: Film,
      isCompleted: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDDD7] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] rounded-xl text-[#626262] hover:text-[#141414] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Inicio</span>
          </button>
          <div className="h-4 w-px bg-[#DEDDD7]" />
          <div>
            <span className="text-[10px] font-bold font-mono uppercase text-[#407B5D] block">
              MÓDULO PILOTO · LABORATORIO DE CÓDIGO CREATIVO
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] tracking-tight">
              Exploraciones con Processing
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#626262]">
          <span className="w-2 h-2 rounded-full bg-[#407B5D]" />
          <span>Secuencia Progresiva (1 → 2 → 3)</span>
        </div>
      </div>

      {/* 3 Exercises Stepper Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {exercises.map((ex, index) => {
          const isActive = activeExerciseIndex === index;
          const Icon = ex.icon;

          return (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(index)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                isActive
                  ? 'border-[#2868D9] bg-white shadow-md ring-2 ring-[#2868D9]/20'
                  : 'border-[#DEDDD7] bg-white hover:border-[#A4A4A0] hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                      isActive ? 'bg-[#2868D9] text-white' : 'bg-[#FAF9F5] text-[#626262]'
                    }`}
                  >
                    {ex.number}
                  </span>
                  <span className="text-[11px] font-mono text-[#8E8E89]">{ex.badge}</span>
                </div>

                {ex.isCompleted && (
                  <span className="text-xs text-[#407B5D] bg-[#E8EEE8] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#141414] tracking-tight">
                  {ex.title}
                </h3>
                <p className="text-xs text-[#626262]">{ex.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* EXERCISE 1: SISTEMAS DE COORDENADAS */}
      {activeExerciseIndex === 0 && (
        <CoordinateSystemExercise
          config={configs?.coordinates}
          initialEvidence={coordEvidence}
          onSaveEvidence={handleSaveCoordinateEvidence}
          onNextExercise={() => handleSelectExercise(1)}
        />
      )}

      {/* EXERCISE 2: ESTRUCTURAS CONDICIONALES */}
      {activeExerciseIndex === 1 && (
        <ConditionalDecisionsExercise
          config={configs?.conditionals}
          initialEvidence={condEvidence}
          onSaveEvidence={handleSaveConditionalEvidence}
          onNextExercise={() => handleSelectExercise(2)}
          onPrevExercise={() => handleSelectExercise(0)}
        />
      )}

      {/* EXERCISE 3: EJERCICIO AUDIOVISUAL EXISTENTE (CONSERVADO ÍNTEGRAMENTE) */}
      {activeExerciseIndex === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-[#DEDDD7] pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase bg-[#E8EEE8] text-[#407B5D] px-2.5 py-0.5 rounded">
                  Ejercicio 03 · Audiovisual
                </span>
                <span className="text-[#A4A4A0]">/</span>
                <span className="text-xs font-bold text-[#626262]">
                  Instalación Interactiva Completa
                </span>
              </div>
              <span className="text-xs font-mono text-[#626262]">
                Video: Sallie Gardner at a Gallop (Eadweard Muybridge)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
              Discretización de Video a Caracteres ASCII con División Interactiva
            </h2>
            <p className="text-xs text-[#626262] leading-relaxed max-w-3xl">
              Arrastra la línea divisoria central <code className="bg-[#E8EEE8] px-1.5 py-0.5 rounded text-[#232A24] font-bold">&lt;&gt;</code> para comparar en tiempo real el fotograma original contra la cuantización tipográfica en Processing Java.
            </p>
          </div>

          {/* Existing Video ASCII Split Canvas preserved completely */}
          <VideoAsciiSplitCanvas defaultVideoSrc="/video.mp4" />

          {/* Navigation footer for sequence */}
          <div className="pt-4 border-t border-[#DEDDD7] flex items-center justify-between">
            <button
              onClick={() => handleSelectExercise(1)}
              className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer"
            >
              ← Ejercicio Anterior (Condicionales)
            </button>
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Finalizar Recorrido de Exploraciones</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
