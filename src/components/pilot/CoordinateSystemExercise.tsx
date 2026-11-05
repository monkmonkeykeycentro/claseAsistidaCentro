/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CoordinateEvidence,
  PedagogicalStage,
  PilotExerciseConfig,
} from '../../types/pilotExercises';
import {
  Compass,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Save,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ChevronRight,
  Info,
  Layers,
  Code2,
  FileCheck,
  Download,
  Check,
} from 'lucide-react';

interface CoordinateSystemExerciseProps {
  config?: PilotExerciseConfig;
  initialEvidence?: Partial<CoordinateEvidence>;
  onSaveEvidence?: (evidence: CoordinateEvidence) => Promise<void> | void;
  onNextExercise?: () => void;
}

const DEFAULT_CODE = `void setup() {
  size(600, 400);
}

void draw() {
  background(245, 245, 248);

  // 1. Dibuja un círculo centrado en (300, 200) de diámetro 60
  fill(40, 123, 93);
  ellipse(300, 200, 60, 60);

  // 2. Dibuja un rectángulo en (100, 80) de ancho 120 y alto 60
  fill(49, 105, 216);
  rect(100, 80, 120, 60);

  // 3. Traza una línea horizontal que divida el lienzo a la mitad Y = 200
  stroke(200, 50, 50);
  line(0, 200, 600, 200);
}`;

const PREDICTION_OPTIONS = [
  {
    id: 'opt1',
    text: 'El rectángulo inicia en la esquina superior izquierda (100, 80) y el círculo se centra exactamente en la mitad de la pantalla (300, 200).',
    isCorrect: true,
    feedback: '¡Correcto! En Processing, rect(x, y, w, h) sitúa su esquina superior izquierda en (x, y) por defecto, mientras que ellipse(x, y, w, h) usa (x, y) como centro.',
  },
  {
    id: 'opt2',
    text: 'Ambas figuras se dibujan desde la esquina inferior izquierda porque así funcionan los planos de matemáticas.',
    isCorrect: false,
    feedback: 'No es así. En Processing, el origen (0,0) está arriba a la izquierda y el eje Y desciende hacia abajo, a diferencia de la geometría escolar tradicional.',
  },
  {
    id: 'opt3',
    text: 'El círculo se colocará en (0,0) porque ellipse() no admite parámetros de traslación.',
    isCorrect: false,
    feedback: 'Incorrecto. Los dos primeros parámetros de ellipse(x, y, w, h) definen con exactitud las coordenadas del centro.',
  },
];

export const CoordinateSystemExercise: React.FC<CoordinateSystemExerciseProps> = ({
  config,
  initialEvidence,
  onSaveEvidence,
  onNextExercise,
}) => {
  const [currentStage, setCurrentStage] = useState<PedagogicalStage>(
    initialEvidence?.currentStage || 'observar'
  );

  // Interactive mouse/touch coordinates in canvas
  const [interactiveCoords, setInteractiveCoords] = useState<{ x: number; y: number }>({
    x: 300,
    y: 200,
  });
  const [isPointerInside, setIsPointerInside] = useState(false);

  // Evidence state
  const [selectedPrediction, setSelectedPrediction] = useState<string>(
    initialEvidence?.prediction || ''
  );
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  // Code editor state
  const [studentCode, setStudentCode] = useState<string>(
    initialEvidence?.code || DEFAULT_CODE
  );

  // Interactive tweak values for Experimentar stage
  const [paramCircleX, setParamCircleX] = useState<number>(300);
  const [paramCircleY, setParamCircleY] = useState<number>(200);
  const [paramRectX, setParamRectX] = useState<number>(100);
  const [paramRectY, setParamRectY] = useState<number>(80);
  const [paramLineY, setParamLineY] = useState<number>(200);

  // Target hits validation
  const [targetHits, setTargetHits] = useState({
    circleAtCenter: false,
    rectAtZone: false,
    lineAcross: false,
  });

  // Reflection text
  const [reflectionText, setReflectionText] = useState<string>(
    initialEvidence?.reflection || ''
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const expCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Validate target hits based on parameters or code
  useEffect(() => {
    const circleOk = Math.abs(paramCircleX - 300) <= 15 && Math.abs(paramCircleY - 200) <= 15;
    const rectOk = Math.abs(paramRectX - 100) <= 15 && Math.abs(paramRectY - 80) <= 15;
    const lineOk = Math.abs(paramLineY - 200) <= 10;
    setTargetHits({
      circleAtCenter: circleOk,
      rectAtZone: rectOk,
      lineAcross: lineOk,
    });
  }, [paramCircleX, paramCircleY, paramRectX, paramRectY, paramLineY]);

  // Draw Observation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 400;
    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = '#FAF9F5';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines (every 50px)
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.strokeStyle = x % 100 === 0 ? '#DEDDD7' : '#ECEBE4';
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      if (x % 100 === 0 && x > 0 && x < width) {
        ctx.fillStyle = '#8E8E89';
        ctx.font = '10px IBM Plex Mono, monospace';
        ctx.fillText(`X:${x}`, x + 4, 14);
      }
    }

    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.strokeStyle = y % 100 === 0 ? '#DEDDD7' : '#ECEBE4';
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      if (y % 100 === 0 && y > 0 && y < height) {
        ctx.fillStyle = '#8E8E89';
        ctx.font = '10px IBM Plex Mono, monospace';
        ctx.fillText(`Y:${y}`, 4, y - 4);
      }
    }

    // Origin (0,0) Callout
    ctx.fillStyle = '#D34E43';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Axis indicators with arrows
    ctx.strokeStyle = '#232A24';
    ctx.lineWidth = 2.5;

    // X Axis line
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(120, 2);
    ctx.stroke();
    // X arrow
    ctx.beginPath();
    ctx.moveTo(115, -4);
    ctx.lineTo(125, 2);
    ctx.lineTo(115, 8);
    ctx.fillStyle = '#232A24';
    ctx.fill();

    // Y Axis line
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(2, 100);
    ctx.stroke();
    // Y arrow
    ctx.beginPath();
    ctx.moveTo(-4, 95);
    ctx.lineTo(2, 105);
    ctx.lineTo(8, 95);
    ctx.fill();

    // Axis text labels
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    ctx.fillStyle = '#2868D9';
    ctx.fillText('+X (derecha)', 132, 14);
    ctx.fillStyle = '#D34E43';
    ctx.fillText('+Y (hacia abajo)', 8, 120);

    // Crosshairs to current interactive position
    const { x, y } = interactiveCoords;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#407B5D';

    // Horizontal projection to Y axis
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Vertical projection to X axis
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Movable shape at (x, y)
    ctx.fillStyle = 'rgba(64, 123, 93, 0.2)';
    ctx.strokeStyle = '#407B5D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#407B5D';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Coordinate tooltip badge
    ctx.fillStyle = '#141414';
    const label = `(${Math.round(x)}, ${Math.round(y)})`;
    ctx.font = 'bold 12px IBM Plex Mono, monospace';
    const textWidth = ctx.measureText(label).width;
    const badgeX = x + 15 + textWidth > width ? x - textWidth - 25 : x + 12;
    const badgeY = y - 25 < 15 ? y + 25 : y - 15;

    ctx.fillRect(badgeX - 6, badgeY - 14, textWidth + 12, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, badgeX, badgeY);
  }, [interactiveCoords]);

  // Draw Experimentation Canvas
  useEffect(() => {
    const canvas = expCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 400;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#FAF9F5';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#ECEBE4';
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ghost target zones (Metas pedagógicas)
    // 1. Target center zone
    ctx.strokeStyle = targetHits.circleAtCenter ? '#407B5D' : '#D9AA3D';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(300, 200, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.fillStyle = targetHits.circleAtCenter ? '#407B5D' : '#8E8E89';
    ctx.fillText('Meta 1: Centro (300, 200)', 240, 250);

    // 2. Target rect zone
    ctx.strokeStyle = targetHits.rectAtZone ? '#407B5D' : '#D9AA3D';
    ctx.strokeRect(100, 80, 120, 60);
    ctx.fillStyle = targetHits.rectAtZone ? '#407B5D' : '#8E8E89';
    ctx.fillText('Meta 2: Rect (100, 80)', 105, 72);

    // 3. Target line zone
    ctx.strokeStyle = targetHits.lineAcross ? '#407B5D' : '#D9AA3D';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(width, 200);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Rendered Figures according to student parameter values
    // Rect
    ctx.fillStyle = 'rgba(49, 105, 216, 0.85)';
    ctx.fillRect(paramRectX, paramRectY, 120, 60);
    ctx.strokeStyle = '#2868D9';
    ctx.lineWidth = 2;
    ctx.strokeRect(paramRectX, paramRectY, 120, 60);

    // Circle
    ctx.fillStyle = 'rgba(64, 123, 93, 0.85)';
    ctx.beginPath();
    ctx.arc(paramCircleX, paramCircleY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#407B5D';
    ctx.stroke();

    // Line
    ctx.strokeStyle = '#D34E43';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, paramLineY);
    ctx.lineTo(width, paramLineY);
    ctx.stroke();
  }, [paramCircleX, paramCircleY, paramRectX, paramRectY, paramLineY, targetHits]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.max(0, Math.min(600, (e.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(400, (e.clientY - rect.top) * scaleY));
    setInteractiveCoords({ x, y });
    setIsPointerInside(true);
  };

  const handleSelectPrediction = (optId: string) => {
    setSelectedPrediction(optId);
    const chosen = PREDICTION_OPTIONS.find((o) => o.id === optId);
    if (chosen) {
      setPredictionFeedback(chosen.feedback);
    }
  };

  const handleSaveAll = async () => {
    setSaveStatus('Guardando...');
    const evidence: CoordinateEvidence = {
      prediction: selectedPrediction,
      code: studentCode,
      targetHits,
      reflection: reflectionText,
      completed: targetHits.circleAtCenter && targetHits.rectAtZone && targetHits.lineAcross,
      updatedAt: new Date().toISOString(),
      currentStage,
    };

    try {
      if (onSaveEvidence) {
        await onSaveEvidence(evidence);
      }
      localStorage.setItem('pilot_coordinate_evidence', JSON.stringify(evidence));
      setSaveStatus('¡Evidencia guardada exitosamente!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      setSaveStatus('Guardado local completado.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const stagesOrder: PedagogicalStage[] = [
    'observar',
    'interpretar',
    'escribir',
    'experimentar',
    'documentar',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Exercise Header */}
      <div className="border-b border-[#DEDDD7] pb-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase bg-[#E8EEE8] text-[#407B5D] px-2.5 py-0.5 rounded">
              Ejercicio 01 · Piloto
            </span>
            <span className="text-[#A4A4A0]">/</span>
            <span className="text-xs font-bold text-[#626262]">
              Metodología de 5 Etapas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {targetHits.circleAtCenter && targetHits.rectAtZone && targetHits.lineAcross && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407B5D] bg-[#E8EEE8] px-2.5 py-1 rounded">
                <Check className="w-3.5 h-3.5" />
                <span>3 Metas Alcanzadas</span>
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
          {config?.title || 'Del espacio a la forma: Sistemas de coordenadas'}
        </h1>
        <p className="text-sm text-[#626262] leading-relaxed max-w-3xl">
          {config?.objective ||
            'Comprender el sistema cartesiano de Processing Java y utilizar coordenadas precisas (X, Y) para posicionar elementos gráficos.'}
        </p>
      </div>

      {/* 5-Step Progress Stepper */}
      <div className="grid grid-cols-5 gap-2 border border-[#DEDDD7] bg-white p-2 rounded-xl text-xs font-mono">
        {stagesOrder.map((st, index) => {
          const isActive = currentStage === st;
          const isDone = stagesOrder.indexOf(currentStage) > index;
          return (
            <button
              key={st}
              onClick={() => setCurrentStage(st)}
              className={`py-2 px-1 text-center font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#2868D9] text-white shadow-xs'
                  : isDone
                  ? 'bg-[#E8EEE8] text-[#407B5D]'
                  : 'text-[#626262] hover:bg-[#FAF9F5]'
              }`}
            >
              <span className="opacity-75">0{index + 1}.</span>
              <span className="capitalize">{st}</span>
            </button>
          );
        })}
      </div>

      {/* STAGE 1: OBSERVAR */}
      {currentStage === 'observar' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEDDD7] rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#2868D9] font-mono">
                  ETAPA 1: OBSERVAR
                </span>
                <h2 className="text-lg font-bold text-[#141414]">
                  Exploración de la retícula y el origen (0, 0)
                </h2>
                <p className="text-xs text-[#626262]">
                  Mueve el cursor sobre el lienzo para examinar cómo cambian las coordenadas (X, Y) y observa la correspondencia directa con la función de Processing.
                </p>
              </div>

              <div className="p-2.5 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl font-mono text-xs space-y-1 text-right">
                <span className="text-[#8E8E89] block text-[10px]">INSTRUCCIÓN VIVA</span>
                <span className="text-[#2868D9] font-bold block">
                  ellipse({Math.round(interactiveCoords.x)}, {Math.round(interactiveCoords.y)}, 40, 40);
                </span>
              </div>
            </div>

            {/* Interactive Canvas Container */}
            <div className="relative border border-[#DEDDD7] rounded-xl overflow-hidden flex justify-center bg-[#FAF9F5]">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onMouseMove={handleCanvasMouseMove}
                onMouseEnter={() => setIsPointerInside(true)}
                onMouseLeave={() => setIsPointerInside(false)}
                className="cursor-crosshair w-full max-w-[600px] h-auto block"
              />
            </div>

            {/* Pedagogical Observations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1">
                <span className="font-bold text-[#D34E43] flex items-center gap-1 font-mono">
                  <ArrowDown className="w-3.5 h-3.5" /> Origen en (0, 0)
                </span>
                <p className="text-[#626262]">
                  A diferencia de las matemáticas tradicionales, el origen está arriba a la izquierda. El límite inferior derecho es <code>(width, height)</code> = (600, 400).
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1">
                <span className="font-bold text-[#2868D9] flex items-center gap-1 font-mono">
                  <ArrowRight className="w-3.5 h-3.5" /> Eje X Horizontal
                </span>
                <p className="text-[#626262]">
                  Avanza de izquierda a derecha. Crece cuando te alejas del borde izquierdo de la ventana del sketch.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1">
                <span className="font-bold text-[#407B5D] flex items-center gap-1 font-mono">
                  <ArrowDown className="w-3.5 h-3.5" /> Eje Y Vertical
                </span>
                <p className="text-[#626262]">
                  Aumenta de arriba hacia abajo. En la línea 200 estás en la mitad exacta vertical de un lienzo de 400px.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStage('interpretar')}
              className="px-5 py-2.5 bg-[#2868D9] hover:bg-[#1f54b3] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Avanzar a Interpretar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: INTERPRETAR */}
      {currentStage === 'interpretar' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEDDD7] rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2868D9] font-mono">
                ETAPA 2: INTERPRETAR
              </span>
              <h2 className="text-lg font-bold text-[#141414]">
                Lectura de instrucciones y predicción espacial
              </h2>
              <p className="text-xs text-[#626262]">
                Antes de ejecutar el código, analiza las funciones <code>rect()</code> y <code>ellipse()</code> y predice cómo se posicionarán en el lienzo cartesiano.
              </p>
            </div>

            {/* Code Snippet for Analysis */}
            <div className="border border-[#DEDDD7] rounded-xl bg-[#141414] text-[#FAF9F5] p-4 font-mono text-xs space-y-1">
              <div className="text-[#8E8E89]">// Código de predicción:</div>
              <div className="text-[#D9AA3D]">size(600, 400);</div>
              <div className="text-[#A4A4A0]">background(240);</div>
              <div><span className="text-[#2868D9]">rect</span>(150, 100, 80, 50);</div>
              <div><span className="text-[#407B5D]">ellipse</span>(300, 200, 60, 60);</div>
            </div>

            {/* Prediction Question & Options */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#141414] block">
                Pregunta de Predicción: ¿Cómo se posicionan estas figuras relativas al sistema de coordenadas?
              </label>

              <div className="space-y-2">
                {PREDICTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectPrediction(opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-sans transition-all flex items-start gap-3 cursor-pointer ${
                      selectedPrediction === opt.id
                        ? opt.isCorrect
                          ? 'border-[#407B5D] bg-[#E8EEE8] text-[#141414]'
                          : 'border-[#D34E43] bg-[#FDF2F2] text-[#141414]'
                        : 'border-[#DEDDD7] bg-white hover:bg-[#FAF9F5] text-[#626262]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center text-[10px] ${
                        selectedPrediction === opt.id
                          ? opt.isCorrect
                            ? 'bg-[#407B5D] text-white border-[#407B5D]'
                            : 'bg-[#D34E43] text-white border-[#D34E43]'
                          : 'border-[#A4A4A0]'
                      }`}
                    >
                      {selectedPrediction === opt.id && '✓'}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>

              {predictionFeedback && (
                <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl text-xs text-[#141414] flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#2868D9] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{predictionFeedback}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStage('observar')}
              className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer"
            >
              ← Volver a Observar
            </button>
            <button
              onClick={() => setCurrentStage('escribir')}
              className="px-5 py-2.5 bg-[#2868D9] hover:bg-[#1f54b3] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Avanzar a Escribir</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: ESCRIBIR */}
      {currentStage === 'escribir' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEDDD7] rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2868D9] font-mono">
                ETAPA 3: ESCRIBIR
              </span>
              <h2 className="text-lg font-bold text-[#141414]">
                Completar y modificar código Processing Java
              </h2>
              <p className="text-xs text-[#626262]">
                Escribe las instrucciones necesarias en Processing Java para posicionar las figuras solicitadas. Revisa la sintaxis estricta de Java (punto y coma al final, parámetros separados por comas).
              </p>
            </div>

            {/* Target Criteria Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 border border-[#DEDDD7] rounded-xl bg-[#FAF9F5] space-y-1">
                <span className="text-[#407B5D] font-bold block">1. Círculo Central</span>
                <code className="text-[11px] text-[#626262]">ellipse(300, 200, 60, 60);</code>
              </div>
              <div className="p-3 border border-[#DEDDD7] rounded-xl bg-[#FAF9F5] space-y-1">
                <span className="text-[#2868D9] font-bold block">2. Rectángulo</span>
                <code className="text-[11px] text-[#626262]">rect(100, 80, 120, 60);</code>
              </div>
              <div className="p-3 border border-[#DEDDD7] rounded-xl bg-[#FAF9F5] space-y-1">
                <span className="text-[#D34E43] font-bold block">3. Línea Divisoria</span>
                <code className="text-[11px] text-[#626262]">line(0, 200, 600, 200);</code>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8E8E89]">
                <span>Sketch.pde (Processing Java 4.3)</span>
                <button
                  onClick={() => setStudentCode(DEFAULT_CODE)}
                  className="hover:text-[#141414] text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar plantilla
                </button>
              </div>

              <textarea
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                rows={14}
                className="w-full p-4 font-mono text-xs bg-[#141414] text-[#FAF9F5] border border-[#232A24] rounded-xl focus:outline-none focus:border-[#2868D9] leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStage('interpretar')}
              className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer"
            >
              ← Volver a Interpretar
            </button>
            <button
              onClick={() => setCurrentStage('experimentar')}
              className="px-5 py-2.5 bg-[#2868D9] hover:bg-[#1f54b3] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Avanzar a Experimentar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: EXPERIMENTAR */}
      {currentStage === 'experimentar' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEDDD7] rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2868D9] font-mono">
                ETAPA 4: EXPERIMENTAR
              </span>
              <h2 className="text-lg font-bold text-[#141414]">
                Ajuste fino de parámetros y validación de metas
              </h2>
              <p className="text-xs text-[#626262]">
                Modifica los deslizadores de coordenadas para encajar cada figura en su respectiva zona meta (las zonas punteadas). Comprueba cómo los valores numéricos influyen en tiempo real sobre la geometría.
              </p>
            </div>

            {/* Target status bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div
                className={`p-2.5 border rounded-xl flex items-center justify-between ${
                  targetHits.circleAtCenter
                    ? 'border-[#407B5D] bg-[#E8EEE8] text-[#407B5D] font-bold'
                    : 'border-[#DEDDD7] bg-white text-[#626262]'
                }`}
              >
                <span>Círculo en centro</span>
                {targetHits.circleAtCenter ? 'ALCANZADO ✓' : 'Pendiente'}
              </div>

              <div
                className={`p-2.5 border rounded-xl flex items-center justify-between ${
                  targetHits.rectAtZone
                    ? 'border-[#407B5D] bg-[#E8EEE8] text-[#407B5D] font-bold'
                    : 'border-[#DEDDD7] bg-white text-[#626262]'
                }`}
              >
                <span>Rect en (100, 80)</span>
                {targetHits.rectAtZone ? 'ALCANZADO ✓' : 'Pendiente'}
              </div>

              <div
                className={`p-2.5 border rounded-xl flex items-center justify-between ${
                  targetHits.lineAcross
                    ? 'border-[#407B5D] bg-[#E8EEE8] text-[#407B5D] font-bold'
                    : 'border-[#DEDDD7] bg-white text-[#626262]'
                }`}
              >
                <span>Línea en Y=200</span>
                {targetHits.lineAcross ? 'ALCANZADO ✓' : 'Pendiente'}
              </div>
            </div>

            {/* Live Experimentation Canvas */}
            <div className="relative border border-[#DEDDD7] rounded-xl overflow-hidden flex justify-center bg-[#FAF9F5]">
              <canvas
                ref={expCanvasRef}
                width={600}
                height={400}
                className="w-full max-w-[600px] h-auto block"
              />
            </div>

            {/* Interactive Sliders for experimentation */}
            <div className="space-y-4 pt-2 border-t border-[#DEDDD7]">
              <h3 className="text-xs font-bold text-[#141414] font-mono">
                Variación de Parámetros en Tiempo Real:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                {/* Circle Controls */}
                <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-2">
                  <span className="font-bold text-[#407B5D] block">Círculo X, Y:</span>
                  <div>
                    <label className="text-[10px] text-[#8E8E89] flex justify-between">
                      <span>X</span> <span>{paramCircleX}px</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={600}
                      value={paramCircleX}
                      onChange={(e) => setParamCircleX(Number(e.target.value))}
                      className="w-full accent-[#407B5D]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E8E89] flex justify-between">
                      <span>Y</span> <span>{paramCircleY}px</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={400}
                      value={paramCircleY}
                      onChange={(e) => setParamCircleY(Number(e.target.value))}
                      className="w-full accent-[#407B5D]"
                    />
                  </div>
                </div>

                {/* Rect Controls */}
                <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-2">
                  <span className="font-bold text-[#2868D9] block">Rectángulo X, Y:</span>
                  <div>
                    <label className="text-[10px] text-[#8E8E89] flex justify-between">
                      <span>X</span> <span>{paramRectX}px</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={600}
                      value={paramRectX}
                      onChange={(e) => setParamRectX(Number(e.target.value))}
                      className="w-full accent-[#2868D9]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E8E89] flex justify-between">
                      <span>Y</span> <span>{paramRectY}px</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={400}
                      value={paramRectY}
                      onChange={(e) => setParamRectY(Number(e.target.value))}
                      className="w-full accent-[#2868D9]"
                    />
                  </div>
                </div>

                {/* Line Controls */}
                <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-2">
                  <span className="font-bold text-[#D34E43] block">Línea Y:</span>
                  <div>
                    <label className="text-[10px] text-[#8E8E89] flex justify-between">
                      <span>Y</span> <span>{paramLineY}px</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={400}
                      value={paramLineY}
                      onChange={(e) => setParamLineY(Number(e.target.value))}
                      className="w-full accent-[#D34E43]"
                    />
                  </div>
                  <p className="text-[10px] text-[#8E8E89] pt-2">
                    Traza de (0, Y) a (600, Y) para cruzar todo el ancho del lienzo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStage('escribir')}
              className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer"
            >
              ← Volver a Escribir
            </button>
            <button
              onClick={() => setCurrentStage('documentar')}
              className="px-5 py-2.5 bg-[#2868D9] hover:bg-[#1f54b3] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Avanzar a Documentar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: DOCUMENTAR */}
      {currentStage === 'documentar' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEDDD7] rounded-2xl p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#2868D9] font-mono">
                ETAPA 5: DOCUMENTAR
              </span>
              <h2 className="text-lg font-bold text-[#141414]">
                Registro de evidencia pedagógica y reflexión
              </h2>
              <p className="text-xs text-[#626262]">
                Explica cómo resolviste las coordenadas y qué decisiones tomaste para posicionar cada primitiva en Processing.
              </p>
            </div>

            {/* Reflection Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] block">
                Reflexión personal: ¿Por qué en programación gráfica el eje Y desciende y qué diferencia hubo entre la colocación de <code>ellipse()</code> y <code>rect()</code>?
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Escribe aquí tu análisis: por ejemplo, cómo calculaste el centro exacto (width/2, height/2), la diferencia entre el punto de anclaje de un rectángulo frente a una elipse, y qué aprendiste sobre la orientación de los ejes..."
                rows={5}
                className="w-full p-3.5 border border-[#DEDDD7] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#2868D9] leading-relaxed resize-y"
              />
            </div>

            {/* Evidence summary card */}
            <div className="p-4 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-2 text-xs font-mono">
              <span className="text-[#8E8E89] block font-bold">RESUMEN DE EVIDENCIA:</span>
              <div className="flex flex-wrap gap-4 text-[#141414]">
                <span>Predicción: <strong>{selectedPrediction ? 'Respondida' : 'Pendiente'}</strong></span>
                <span>Código: <strong>{studentCode.length > 50 ? 'Completo' : 'Básico'}</strong></span>
                <span>
                  Metas alcanzadas:{' '}
                  <strong>
                    {Object.values(targetHits).filter(Boolean).length} / 3
                  </strong>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DEDDD7]">
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-[#407B5D] hover:bg-[#33654C] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Evidencia</span>
              </button>

              {saveStatus && (
                <span className="text-xs font-bold text-[#407B5D] font-mono">
                  {saveStatus}
                </span>
              )}

              {onNextExercise && (
                <button
                  onClick={onNextExercise}
                  className="px-5 py-2.5 bg-[#2868D9] hover:bg-[#1f54b3] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
                >
                  <span>Siguiente Ejercicio: Condicionales</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => setCurrentStage('experimentar')}
              className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer"
            >
              ← Volver a Experimentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
