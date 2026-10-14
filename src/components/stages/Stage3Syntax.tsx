import React, { useState } from 'react';
import { ETAPA3_EXERCISES } from '../../data/stageData';
import { SyntaxExercise } from '../../types/classStructure';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface Stage3Props {
  onComplete: () => void;
  isCompleted: boolean;
  onGoNext: () => void;
  completedExerciseIds: string[];
  onSaveCompletedExercise: (id: string) => void;
}

export const Stage3Syntax: React.FC<Stage3Props> = ({
  onComplete,
  isCompleted,
  onGoNext,
  completedExerciseIds,
  onSaveCompletedExercise,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userInputs, setUserInputs] = useState<Record<string, Record<string, string>>>({});
  const [feedbackState, setFeedbackState] = useState<
    Record<string, { status: 'idle' | 'success' | 'error'; message: string }>
  >({});
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentExercise: SyntaxExercise = ETAPA3_EXERCISES[currentIdx];

  const currentInputs = userInputs[currentExercise.id] || {};
  const currentFeedback = feedbackState[currentExercise.id] || {
    status: 'idle',
    message: '',
  };

  const handleInputChange = (blankId: string, val: string) => {
    setUserInputs((prev) => ({
      ...prev,
      [currentExercise.id]: {
        ...(prev[currentExercise.id] || {}),
        [blankId]: val,
      },
    }));
    // Reset feedback on change
    setFeedbackState((prev) => ({
      ...prev,
      [currentExercise.id]: { status: 'idle', message: '' },
    }));
  };

  const handleQuickInsert = (blankId: string, text: string) => {
    handleInputChange(blankId, text);
  };

  const handleCheckCurrent = () => {
    let allValid = true;
    let errorDetail = '';

    for (const blank of currentExercise.blanks) {
      const val = (currentInputs[blank.id] || '').trim();

      if (!val) {
        allValid = false;
        errorDetail = `Falta completar el campo "${blank.label}".`;
        break;
      }

      // Special rule for exercise B (valid attribute name identifier)
      if (currentExercise.id === 'ex-b-attribute') {
        const isValidIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val);
        const isNotKeyword = !['class', 'void', 'int', 'String', 'float', 'boolean', 'new'].includes(val);
        if (!isValidIdentifier) {
          allValid = false;
          errorDetail = `"${val}" no es un nombre de variable válido en Java. Debe empezar por una letra o guión bajo y no contener espacios.`;
          break;
        }
        if (!isNotKeyword) {
          allValid = false;
          errorDetail = `"${val}" es una palabra reservada del lenguaje y no puede usarse como nombre de atributo.`;
          break;
        }
      } else {
        const match = blank.caseSensitive
          ? blank.expected.includes(val)
          : blank.expected.some((exp) => exp.toLowerCase() === val.toLowerCase());

        if (!match) {
          allValid = false;
          errorDetail = `Respuesta no esperada para "${blank.label}". Pista: ${blank.hint}`;
          break;
        }
      }
    }

    if (allValid) {
      setFeedbackState((prev) => ({
        ...prev,
        [currentExercise.id]: {
          status: 'success',
          message: '¡Excelente! Sintaxis correcta y validada.',
        },
      }));
      onSaveCompletedExercise(currentExercise.id);

      // Check if all exercises are now completed
      const updatedList = Array.from(
        new Set([...completedExerciseIds, currentExercise.id])
      );
      if (updatedList.length === ETAPA3_EXERCISES.length) {
        onComplete();
      }
    } else {
      setFeedbackState((prev) => ({
        ...prev,
        [currentExercise.id]: {
          status: 'error',
          message: errorDetail,
        },
      }));
    }
  };

  const handleResetCurrent = () => {
    setUserInputs((prev) => ({
      ...prev,
      [currentExercise.id]: {},
    }));
    setFeedbackState((prev) => ({
      ...prev,
      [currentExercise.id]: { status: 'idle', message: '' },
    }));
    setShowHint(false);
  };

  // Helper quick buttons based on current exercise
  const getQuickButtons = () => {
    switch (currentExercise.id) {
      case 'ex-a-class':
        return ['class', 'void', 'new', 'Gato'];
      case 'ex-b-attribute':
        return ['nombre', 'color', 'raza', 'edad', 'peso'];
      case 'ex-c-constructor':
        return ['Gato', 'gato', 'void', 'new'];
      case 'ex-d-params':
        return ['void', 'int', 'String', 'float'];
      case 'ex-e-assignment':
        return ['=', ';', '==', ':'];
      case 'ex-f-braces':
        return ['{', '}', '(', ')'];
      case 'ex-g-parentheses':
        return ['(', ')', '{', '}'];
      case 'ex-h-commas':
        return [',', ';', ':', '.'];
      case 'ex-i-semicolons':
        return [';', ',', ':', '{'];
      default:
        return [];
    }
  };

  const isCurrentDone = completedExerciseIds.includes(currentExercise.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Etapa 3
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Micro-ejercicios sintácticos</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Completar la sintaxis de Processing Java
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-xs font-medium text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Todos los ejercicios completados ({ETAPA3_EXERCISES.length}/{ETAPA3_EXERCISES.length})
            </div>
          )}
        </div>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Escribe o selecciona los elementos faltantes en cada caso. Aprenderás el papel exacto de palabras clave, nombres de atributos, nombres del constructor, tipos y signos como llaves <code className="text-amber-300 font-mono">{'{ }'}</code>, paréntesis <code className="text-purple-300 font-mono">( )</code>, comas <code className="text-slate-300 font-mono">,</code> y puntos y coma <code className="text-slate-300 font-mono">;</code>.
        </p>
      </div>

      {/* Progress navigation strip */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1">
          {ETAPA3_EXERCISES.map((ex, idx) => {
            const isCompletedEx = completedExerciseIds.includes(ex.id);
            const isCurrent = currentIdx === idx;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setShowHint(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : isCompletedEx
                    ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{ex.title.split(':')[0]}</span>
                {isCompletedEx && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-4">
          <button
            onClick={() => {
              if (currentIdx > 0) {
                setCurrentIdx(currentIdx - 1);
                setShowHint(false);
              }
            }}
            disabled={currentIdx === 0}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-1">
            {currentIdx + 1}/{ETAPA3_EXERCISES.length}
          </span>
          <button
            onClick={() => {
              if (currentIdx < ETAPA3_EXERCISES.length - 1) {
                setCurrentIdx(currentIdx + 1);
                setShowHint(false);
              }
            }}
            disabled={currentIdx === ETAPA3_EXERCISES.length - 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Area Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Area 1: Elementos y botones rápidos (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Sugerencias rápidas
            </h3>
            <span className="text-[11px] text-slate-500">Insertar al campo</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs text-slate-300">
              Opciones sintácticas comunes para este ejercicio:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getQuickButtons().map((token) => (
                <button
                  key={token}
                  onClick={() => {
                    // Fill the first empty blank or the first blank
                    const targetBlank =
                      currentExercise.blanks.find((b) => !currentInputs[b.id]) ||
                      currentExercise.blanks[0];
                    if (targetBlank) {
                      handleQuickInsert(targetBlank.id, token);
                    }
                  }}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>{token}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              También puedes escribir directamente con el teclado en cada casilla.
            </p>
          </div>

          {/* Semicolon & Bracket didactic reminder */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Regla de oro sobre puntos y coma</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>¡No todas las líneas llevan punto y coma!</strong> Las líneas que abren bloques mediante una llave <code className="text-amber-300 font-mono">{'{'}</code> (como <code className="text-slate-200 font-mono">class Gato</code> o <code className="text-slate-200 font-mono">void dibujar()</code>) <strong>NUNCA</strong> llevan punto y coma.
            </p>
          </div>
        </div>

        {/* Area 2: Espacio interactivo de resolución (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. {currentExercise.title}
            </h3>
            <span className="text-xs text-cyan-400 font-medium font-mono">
              {currentExercise.badge}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Prompt */}
            <div className="text-sm font-medium text-slate-200">
              {currentExercise.prompt}
            </div>

            {/* Interactive Fill-in Fields */}
            <div className="space-y-3 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                Completa los espacios en blanco:
              </div>

              {currentExercise.blanks.map((blank) => {
                const val = currentInputs[blank.id] || '';
                return (
                  <div key={blank.id} className="flex items-center gap-3">
                    <label className="text-xs font-mono text-slate-300 min-w-36">
                      {blank.label}:
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleInputChange(blank.id, e.target.value)}
                      placeholder={blank.placeholder || blank.label}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                );
              })}
            </div>

            {/* Code Snippet Preview with user inputs filled */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <div className="text-[11px] text-slate-500 font-sans mb-1">
                Visualización de código resultante:
              </div>
              <pre className="whitespace-pre overflow-x-auto text-emerald-300">
                {(() => {
                  let rendered = currentExercise.codeSnippet;
                  currentExercise.blanks.forEach((b) => {
                    const filled = currentInputs[b.id] || '___';
                    rendered = rendered.replace('___', filled);
                  });
                  return rendered;
                })()}
              </pre>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckCurrent}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm"
                >
                  Comprobar respuesta
                </button>
                <button
                  onClick={handleResetCurrent}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpiar
                </button>
              </div>

              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Ocultar pista' : 'Ver pista'}
              </button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200 space-y-1">
                <div className="font-semibold text-amber-300">Pista:</div>
                {currentExercise.blanks.map((b) => (
                  <div key={b.id}>
                    • <strong>{b.label}:</strong> {b.hint}
                  </div>
                ))}
              </div>
            )}

            {/* Feedback alert */}
            {currentFeedback.status !== 'idle' && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  currentFeedback.status === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}
              >
                {currentFeedback.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {currentFeedback.status === 'success' ? '¡Bien hecho!' : 'Revisión sintáctica'}
                  </div>
                  <div>{currentFeedback.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation to next exercise */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Ejercicios superados: {completedExerciseIds.length} de {ETAPA3_EXERCISES.length}
            </span>

            {currentIdx < ETAPA3_EXERCISES.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIdx(currentIdx + 1);
                  setShowHint(false);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                Siguiente ejercicio
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoNext}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                Avanzar a Etapa 4: Construir clase
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Area 3: Explicación de los signos y sintaxis (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Rol del signo / palabra
            </h3>
            <span className="text-xs text-cyan-400 font-medium">Concepto</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
            <div>
              <span className="font-semibold text-slate-200 block mb-1">
                Función en Processing Java:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {currentExercise.signRoleExplanation}
              </p>
            </div>

            {currentExercise.counterConceptNote && (
              <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-rose-200 space-y-1">
                <span className="font-semibold text-rose-300 block">
                  Error común a evitar:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {currentExercise.counterConceptNote}
                </p>
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="font-semibold text-slate-300 block">
                Detalle de los campos:
              </span>
              {currentExercise.blanks.map((blank) => (
                <div key={blank.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-cyan-300 font-mono font-medium block">
                    {blank.label}
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    {blank.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
