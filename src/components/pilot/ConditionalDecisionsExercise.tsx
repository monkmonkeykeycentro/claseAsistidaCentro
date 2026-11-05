/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ConditionalEvidence,
  BoundaryTestResult,
  PedagogicalStage,
  PilotExerciseConfig,
} from '../../types/pilotExercises';
import {
  SplitSquareVertical,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  Play,
  ArrowRight,
  ChevronRight,
  Info,
  Check,
  FileCheck,
  Code2,
} from 'lucide-react';

interface ConditionalDecisionsExerciseProps {
  config?: PilotExerciseConfig;
  initialEvidence?: Partial<ConditionalEvidence>;
  onSaveEvidence?: (evidence: ConditionalEvidence) => Promise<void> | void;
  onNextExercise?: () => void;
  onPrevExercise?: () => void;
}

const DEFAULT_CODE = `void setup() {
  size(600, 400);
}

void draw() {
  background(245, 245, 248);

  // Umbral 1 en X = 200 | Umbral 2 en X = 400
  if (mouseX < 200) {
    // Zona 1: Izquierda (X < 200)
    fill(40, 123, 93); // Verde Processing
    rect(20, 100, 160, 200);
  } else if (mouseX <= 400) {
    // Zona 2: Centro (200 <= X <= 400)
    fill(49, 105, 216); // Azul
    ellipse(300, 200, 140, 140);
  } else {
    // Zona 3: Derecha (X > 400)
    fill(217, 170, 61); // Amarillo
    triangle(450, 300, 500, 100, 550, 300);
  }
}`;

const PREDICTION_OPTIONS = [
  {
    id: 'opt1',
    text: 'Se ejecutará la Zona 2 (else if), porque 200 no es estrictamente menor a 200 (200 < 200 es falso), pero sí es menor o igual a 400 (200 <= 400 es verdadero).',
    isCorrect: true,
    feedback: '¡Exacto! El operador menor estricto (<) descarta el 200 en el primer "if", por lo que el flujo evalúa el "else if" donde 200 <= 400 resulta verdadero.',
  },
  {
    id: 'opt2',
    text: 'Se ejecutará la Zona 1 porque 200 toca el límite del primer if.',
    isCorrect: false,
    feedback: 'Error común: El operador "<" es estricto. La comparación (200 < 200) devuelve false. Para incluir el 200 se necesitaría "<=".',
  },
  {
    id: 'opt3',
    text: 'Se ejecutarán la Zona 1 y la Zona 2 al mismo tiempo.',
    isCorrect: false,
    feedback: 'Incorrecto: En una estructura if / else if / else las ramas son mutuamente excluyentes; en cuanto una condición es verdadera, las demás se ignoran.',
  },
];

const BOUNDARY_VALUES = [
  { x: 199, expected: 'zona1' as const, desc: 'X=199 (estrictamente menor al umbral 1)' },
  { x: 200, expected: 'zona2' as const, desc: 'X=200 (exactamente en el umbral 1)' },
  { x: 201, expected: 'zona2' as const, desc: 'X=201 (estrictamente posterior al umbral 1)' },
  { x: 399, expected: 'zona2' as const, desc: 'X=399 (estrictamente anterior al umbral 2)' },
  { x: 400, expected: 'zona2' as const, desc: 'X=400 (exactamente en el umbral 2)' },
  { x: 401, expected: 'zona3' as const, desc: 'X=401 (estrictamente posterior al umbral 2)' },
];

export const ConditionalDecisionsExercise: React.FC<ConditionalDecisionsExerciseProps> = ({
  config,
  initialEvidence,
  onSaveEvidence,
  onNextExercise,
  onPrevExercise,
}) => {
  const [currentStage, setCurrentStage] = useState<PedagogicalStage>(
    initialEvidence?.currentStage || 'observar'
  );

  // Simulated mouseX position on 600px width canvas
  const [currentX, setCurrentX] = useState<number>(100);

  // Active zone determination
  const determineZone = (x: number): 'zona1' | 'zona2' | 'zona3' => {
    if (x < 200) return 'zona1';
    if (x <= 400) return 'zona2';
    return 'zona3';
  };

  const activeZone = determineZone(currentX);

  // Evidence state
  const [selectedPrediction, setSelectedPrediction] = useState<string>(
    initialEvidence?.prediction || ''
  );
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  // Code editor state
  const [studentCode, setStudentCode] = useState<string>(
    initialEvidence?.code || DEFAULT_CODE
  );

  // Boundary testing results (tracking tests for 199, 200, 201, 399, 400, 401)
  const [boundaryTests, setBoundaryTests] = useState<Record<number, BoundaryTestResult>>(
    initialEvidence?.boundaryTests || {}
  );

  // Reflection text
  const [reflectionText, setReflectionText] = useState<string>(
    initialEvidence?.reflection || ''
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Run a test on a specific boundary value
  const testBoundary = (valueX: number) => {
    setCurrentX(valueX);
    const boundarySpec = BOUNDARY_VALUES.find((b) => b.x === valueX);
    if (!boundarySpec) return;

    const actual = determineZone(valueX);
    const passed = actual === boundarySpec.expected;

    const result: BoundaryTestResult = {
      valueX,
      expectedZone: boundarySpec.expected,
      actualZone: actual,
      passed,
      description: boundarySpec.desc,
    };

    setBoundaryTests((prev) => ({ ...prev, [valueX]: result }));
  };

  // Run all 6 boundary tests automatically
  const runAllBoundaryTests = () => {
    const updated: Record<number, BoundaryTestResult> = {};
    BOUNDARY_VALUES.forEach((b) => {
      const actual = determineZone(b.x);
      updated[b.x] = {
        valueX: b.x,
        expectedZone: b.expected,
        actualZone: actual,
        passed: actual === b.expected,
        description: b.desc,
      };
    });
    setBoundaryTests(updated);
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 400;
    ctx.clearRect(0, 0, width, height);

    // Zone 1 background: X < 200
    ctx.fillStyle = activeZone === 'zona1' ? 'rgba(64, 123, 93, 0.12)' : '#FAF9F5';
    ctx.fillRect(0, 0, 200, height);

    // Zone 2 background: 200 <= X <= 400
    ctx.fillStyle = activeZone === 'zona2' ? 'rgba(40, 104, 217, 0.12)' : '#F5F4EE';
    ctx.fillRect(200, 0, 200, height);

    // Zone 3 background: X > 400
    ctx.fillStyle = activeZone === 'zona3' ? 'rgba(217, 170, 61, 0.12)' : '#FAF9F5';
    ctx.fillRect(400, 0, 200, height);

    // Threshold lines (Umbrales)
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;

    // Threshold X = 200
    ctx.strokeStyle = '#D34E43';
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, height);
    ctx.stroke();

    // Threshold X = 400
    ctx.strokeStyle = '#D34E43';
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zone Headers and labels
    ctx.font = 'bold 11px IBM Plex Mono, monospace';

    // Label Zone 1
    ctx.fillStyle = activeZone === 'zona1' ? '#407B5D' : '#8E8E89';
    ctx.fillText('ZONA 1: mouseX < 200', 16, 28);
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.fillText('[0 .. 199]', 16, 44);

    // Label Zone 2
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    ctx.fillStyle = activeZone === 'zona2' ? '#2868D9' : '#8E8E89';
    ctx.fillText('ZONA 2: mouseX <= 400', 216, 28);
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.fillText('[200 .. 400]', 216, 44);

    // Label Zone 3
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    ctx.fillStyle = activeZone === 'zona3' ? '#D9AA3D' : '#8E8E89';
    ctx.fillText('ZONA 3: else', 416, 28);
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.fillText('[401 .. 600]', 416, 44);

    // Draw active shape according to the active zone
    if (activeZone === 'zona1') {
      ctx.fillStyle = '#407B5D';
      ctx.fillRect(30, 120, 140, 180);
      ctx.strokeStyle = '#232A24';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 120, 140, 180);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px IBM Plex Mono, monospace';
      ctx.fillText('rect(...)', 65, 215);
    } else if (activeZone === 'zona2') {
      ctx.fillStyle = '#2868D9';
      ctx.beginPath();
      ctx.arc(300, 200, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#232A24';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px IBM Plex Mono, monospace';
      ctx.fillText('ellipse(...)', 260, 205);
    } else {
      ctx.fillStyle = '#D9AA3D';
      ctx.beginPath();
      ctx.moveTo(430, 310);
      ctx.lineTo(500, 110);
      ctx.lineTo(570, 310);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#232A24';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#141414';
      ctx.font = 'bold 12px IBM Plex Mono, monospace';
      ctx.fillText('triangle(...)', 455, 240);
    }

    // Active Cursor Vertical Line
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();

    // Cursor indicator handle
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.arc(currentX, 65, 6, 0, Math.PI * 2);
    ctx.fill();

    // MouseX Badge
    const xLabel = `mouseX = ${Math.round(currentX)}`;
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    const textWidth = ctx.measureText(xLabel).width;
    const badgeX = currentX + 10 + textWidth > width ? currentX - textWidth - 16 : currentX + 8;
    ctx.fillStyle = '#141414';
    ctx.fillRect(badgeX - 4, 75, textWidth + 8, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(xLabel, badgeX, 89);
  }, [currentX, activeZone]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = Math.max(0, Math.min(600, (e.clientX - rect.left) * scaleX));
    setCurrentX(x);
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
    const allPassed =
      BOUNDARY_VALUES.every((b) => boundaryTests[b.x]?.passed);

    const evidence: ConditionalEvidence = {
      prediction: selectedPrediction,
      code: studentCode,
      boundaryTests,
      reflection: reflectionText,
      completed: allPassed && Boolean(selectedPrediction),
      updatedAt: new Date().toISOString(),
      currentStage,
    };

    try {
      if (onSaveEvidence) {
        await onSaveEvidence(evidence);
      }
      localStorage.setItem('pilot_conditional_evidence', JSON.stringify(evidence));
      setSaveStatus('¡Evidencia guardada exitosamente!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch {
      setSaveStatus('Guardado local completado.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const passedTestsCount = BOUNDARY_VALUES.filter((b) => boundaryTests[b.x]?.passed).length;
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
              Ejercicio 02 · Piloto
            </span>
            <span className="text-[#A4A4A0]">/</span>
            <span className="text-xs font-bold text-[#626262]">
              Metodología de 5 Etapas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {passedTestsCount === 6 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#407B5D] bg-[#E8EEE8] px-2.5 py-1 rounded">
                <Check className="w-3.5 h-3.5" />
                <span>6 Límites Validados</span>
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
          {config?.title || 'Decisiones visuales: Estructuras condicionales'}
        </h1>
        <p className="text-sm text-[#626262] leading-relaxed max-w-3xl">
          {config?.objective ||
            'Comprender estructuras if, else if y else en Processing Java mediante tres zonas visuales y análisis estricto de valores límite.'}
        </p>
      </div>

      {/* 5-Step Stepper */}
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
                  Tres zonas de bifurcación visual
                </h2>
                <p className="text-xs text-[#626262]">
                  Mueve el cursor horizontalmente sobre el lienzo de 600px. Nota cómo el comportamiento visual cambia instantáneamente al cruzar los umbrales en X=200 y X=400.
                </p>
              </div>

              <div className="p-2.5 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl font-mono text-xs space-y-1 text-right">
                <span className="text-[#8E8E89] block text-[10px]">RAMA ACTIVA</span>
                <span className="text-[#2868D9] font-bold block uppercase">
                  {activeZone === 'zona1'
                    ? 'if (mouseX < 200)'
                    : activeZone === 'zona2'
                    ? 'else if (mouseX <= 400)'
                    : 'else (mouseX > 400)'}
                </span>
              </div>
            </div>

            {/* Interactive 3-Zone Canvas */}
            <div className="relative border border-[#DEDDD7] rounded-xl overflow-hidden flex justify-center bg-[#FAF9F5]">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onMouseMove={handleCanvasMouseMove}
                className="cursor-ew-resize w-full max-w-[600px] h-auto block"
              />
            </div>

            {/* Threshold explanation columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1">
                <span className="font-bold text-[#407B5D] block font-mono">
                  1. Zona Izquierda (0 .. 199)
                </span>
                <p className="text-[#626262]">
                  Condición: <code>mouseX &lt; 200</code>. El 200 queda fuera de esta zona por ser un operador menor estricto.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1">
                <span className="font-bold text-[#2868D9] block font-mono">
                  2. Zona Central (200 .. 400)
                </span>
                <p className="text-[#626262]">
                  Condición: <code>mouseX &lt;= 400</code>. Se ejecuta cuando la primera condición es falsa pero mouseX no excede 400.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1">
                <span className="font-bold text-[#D9AA3D] block font-mono">
                  3. Zona Derecha (401 .. 600)
                </span>
                <p className="text-[#626262]">
                  Cláusula: <code>else</code>. Captura todo valor residual que supere estrictamente a 400.
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
                Lectura y predicción sobre el límite crítico X = 200
              </h2>
              <p className="text-xs text-[#626262]">
                Lee cuidadosamente el fragmento en Processing Java y anticipa qué ocurrirá exactamente en el umbral divisor.
              </p>
            </div>

            {/* Code Block */}
            <div className="border border-[#DEDDD7] rounded-xl bg-[#141414] text-[#FAF9F5] p-4 font-mono text-xs space-y-1">
              <div className="text-[#8E8E89]">// Fragmento a interpretar:</div>
              <div>
                <span className="text-[#2868D9]">if</span> (mouseX &lt; 200) &#123;
              </div>
              <div className="pl-4 text-[#407B5D]">dibujarRectanguloVerde(); // Rama 1</div>
              <div>
                &#125; <span className="text-[#2868D9]">else if</span> (mouseX &lt;= 400) &#123;
              </div>
              <div className="pl-4 text-[#2868D9]">dibujarCirculoAzul(); // Rama 2</div>
              <div>
                &#125; <span className="text-[#2868D9]">else</span> &#123;
              </div>
              <div className="pl-4 text-[#D9AA3D]">dibujarTrianguloAmarillo(); // Rama 3</div>
              <div>&#125;</div>
            </div>

            {/* Prediction Question */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#141414] block">
                Pregunta de Predicción: Si el cursor se sitúa en <code>mouseX = 200</code> exactamente, ¿cuál de las tres ramas se ejecutará?
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
                Editor de bifurcaciones condicionales
              </h2>
              <p className="text-xs text-[#626262]">
                Escribe y ajusta el código en Processing Java. Asegúrate de verificar los operadores relacionales (<code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>) para que las tres zonas no tengan solapamientos o vacíos.
              </p>
            </div>

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8E8E89]">
                <span>Condicionales.pde (Processing Java 4.3)</span>
                <button
                  onClick={() => setStudentCode(DEFAULT_CODE)}
                  className="hover:text-[#141414] text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar código inicial
                </button>
              </div>

              <textarea
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                rows={16}
                className="w-full p-4 font-mono text-xs bg-[#141414] text-[#FAF9F5] border border-[#232A24] rounded-xl focus:outline-none focus:border-[#2868D9] leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>

            {/* Logical Diagnostic feedback (guiding without giving away answer) */}
            <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-[#141414] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2868D9]" /> Pista Didáctica del Compilador:
              </span>
              <p className="text-[#626262] leading-relaxed">
                Si cambiaras <code>mouseX &lt; 200</code> por <code>mouseX &lt;= 200</code>, el número 200 sería absorbido por la Zona 1 antes de que el programa pueda evaluar el <code>else if</code>. En cascadas condicionales, ¡el orden de las condiciones define la prioridad!
              </p>
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
                Pruebas explícitas sobre los valores límite
              </h2>
              <p className="text-xs text-[#626262]">
                La verificación rigurosa de algoritmos requiere probar los valores inmediatamente anteriores, iguales y posteriores a los umbrales de decisión (X=200 y X=400).
              </p>
            </div>

            {/* Test buttons and status grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#141414] font-mono">
                  Batería de 6 Pruebas de Límite: ({passedTestsCount} / 6 Aprobadas)
                </span>
                <button
                  onClick={runAllBoundaryTests}
                  className="text-xs font-bold text-[#2868D9] hover:underline cursor-pointer"
                >
                  Ejecutar todas las pruebas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
                {BOUNDARY_VALUES.map((b) => {
                  const testRes = boundaryTests[b.x];
                  return (
                    <button
                      key={b.x}
                      onClick={() => testBoundary(b.x)}
                      className={`p-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                        testRes
                          ? testRes.passed
                            ? 'border-[#407B5D] bg-[#E8EEE8]'
                            : 'border-[#D34E43] bg-[#FDF2F2]'
                          : 'border-[#DEDDD7] bg-white hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#141414]">X = {b.x}px</span>
                        {testRes && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              testRes.passed ? 'bg-[#407B5D] text-white' : 'bg-[#D34E43] text-white'
                            }`}
                          >
                            {testRes.passed ? 'CORRECTO ✓' : 'FALLO ✗'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#626262]">{b.desc}</span>
                      <span className="text-[10px] text-[#8E8E89]">
                        Esperado: <strong>{b.expected}</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Canvas representation of active test */}
            <div className="relative border border-[#DEDDD7] rounded-xl overflow-hidden flex justify-center bg-[#FAF9F5]">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onMouseMove={handleCanvasMouseMove}
                className="cursor-ew-resize w-full max-w-[600px] h-auto block"
              />
            </div>

            {/* Slider for free test */}
            <div className="p-3 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#141414]">
                <span>Prueba Libre con Cursor o Deslizador:</span>
                <span className="font-bold text-[#2868D9]">mouseX = {Math.round(currentX)}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={600}
                value={currentX}
                onChange={(e) => setCurrentX(Number(e.target.value))}
                className="w-full accent-[#2868D9]"
              />
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
                Registro de evidencia y análisis de límites
              </h2>
              <p className="text-xs text-[#626262]">
                Registra tus conclusiones sobre cómo responde Processing en los valores de borde y por qué los operadores relacionales son esenciales para evitar errores lógicos.
              </p>
            </div>

            {/* Reflection Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#141414] block">
                Reflexión: Explica qué diferencia hay entre &lt; y &lt;= en los umbrales de bifurcación y qué sucedió cuando probaste X=200 y X=400:
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Escribe aquí tu explicación: por ejemplo, cómo la inclusión o exclusión del valor límite determinó cuál rama se ejecutó, y cómo la estructura 'if / else if / else' garantiza que solo una figura se dibuje por fotograma..."
                rows={5}
                className="w-full p-3.5 border border-[#DEDDD7] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#2868D9] leading-relaxed resize-y"
              />
            </div>

            {/* Evidence summary card */}
            <div className="p-4 bg-[#FAF9F5] border border-[#DEDDD7] rounded-xl space-y-2 text-xs font-mono">
              <span className="text-[#8E8E89] block font-bold">RESUMEN DE EVIDENCIA:</span>
              <div className="flex flex-wrap gap-4 text-[#141414]">
                <span>Predicción: <strong>{selectedPrediction ? 'Completada' : 'Pendiente'}</strong></span>
                <span>Pruebas de límite: <strong>{passedTestsCount} / 6 Aprobadas</strong></span>
                <span>Reflexión: <strong>{reflectionText.length > 20 ? 'Registrada' : 'Pendiente'}</strong></span>
              </div>
            </div>

            {/* Actions */}
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
                  <span>Siguiente Ejercicio: Discretización Audiovisual</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            {onPrevExercise && (
              <button
                onClick={onPrevExercise}
                className="px-4 py-2 border border-[#DEDDD7] hover:bg-[#FAF9F5] text-xs font-bold rounded-xl text-[#626262] cursor-pointer"
              >
                ← Ejercicio Anterior (Coordenadas)
              </button>
            )}
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
