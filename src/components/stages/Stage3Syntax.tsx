import React, { useState } from 'react';
import { ETAPA3_EXERCISES } from '../../data/stageData';
import { SyntaxExercise } from '../../types/classStructure';
import {
  Check,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
} from 'lucide-react';
import { renderSnippetWithBlanks } from '../../utils/processingSyntax';

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
    setFeedbackState((prev) => ({
      ...prev,
      [currentExercise.id]: { status: 'idle', message: '' },
    }));
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
          errorDetail = `"${val}" no es un nombre de variable válido en Java.`;
          break;
        }
        if (!isNotKeyword) {
          allValid = false;
          errorDetail = `"${val}" es una palabra reservada del lenguaje.`;
          break;
        }
      } else {
        const match = blank.caseSensitive
          ? blank.expected.includes(val)
          : blank.expected.some((exp) => exp.toLowerCase() === val.toLowerCase());

        if (!match) {
          allValid = false;
          errorDetail = `Respuesta no esperada para "${blank.label}".`;
          break;
        }
      }
    }

    if (allValid) {
      setFeedbackState((prev) => ({
        ...prev,
        [currentExercise.id]: {
          status: 'success',
          message: 'Sintaxis correcta.',
        },
      }));
      onSaveCompletedExercise(currentExercise.id);

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

  return (
    <div className="space-y-10">
      {/* Stage Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              Etapa 03
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
              Completar la sintaxis de Processing Java
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono py-1">
              <Check className="w-3.5 h-3.5 text-zinc-900" />
              <span>Ejercicios superados ({ETAPA3_EXERCISES.length}/{ETAPA3_EXERCISES.length})</span>
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          Escribe las partes faltantes en cada ejercicio para asimilar la estructura de clases, nombres, constructor, métodos y delimitadores.
        </p>
      </div>

      {/* Clean Exercise Navigation Bar */}
      <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-2 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
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
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : isCompletedEx
                    ? 'bg-white text-zinc-800 border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span>{ex.title.split(':')[0]}</span>
                {isCompletedEx && <Check className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => {
              if (currentIdx > 0) {
                setCurrentIdx(currentIdx - 1);
                setShowHint(false);
              }
            }}
            disabled={currentIdx === 0}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 text-zinc-600 transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-zinc-500 px-1">
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 text-zinc-600 transition-colors"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spacious 2-Column Resolution View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Exercise Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-semibold text-zinc-900">
                {currentExercise.title}
              </h3>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                {currentExercise.badge}
              </span>
            </div>

            {/* Prompt */}
            <p className="text-sm font-medium text-zinc-800 leading-relaxed">
              {currentExercise.prompt}
            </p>

            {/* Code Snippet with Processing Java syntax highlighting & live blanks */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-zinc-200 font-mono text-xs sm:text-sm text-zinc-900 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans uppercase tracking-wider mb-2.5 border-b border-zinc-100 pb-1.5">
                <span>Código en Processing:</span>
                <span className="font-mono text-zinc-400">Processing Java</span>
              </div>
              <div className="whitespace-pre overflow-x-auto leading-relaxed">
                {renderSnippetWithBlanks(
                  currentExercise.codeSnippet,
                  currentExercise.blanks,
                  currentInputs
                )}
              </div>
            </div>

            {/* Input Blanks */}
            <div className="space-y-3 pt-1">
              {currentExercise.blanks.map((blank) => {
                const val = currentInputs[blank.id] || '';
                return (
                  <div key={blank.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <label className="text-xs font-mono text-zinc-600 min-w-36">
                      {blank.label}:
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleInputChange(blank.id, e.target.value)}
                      placeholder={blank.placeholder || 'Escribe aquí...'}
                      className="min-h-[44px] flex-1 bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                );
              })}
            </div>

            {/* Action buttons with 44px min touch target */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCheckCurrent}
                  className="min-h-[44px] flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Comprobar</span>
                </button>
                <button
                  onClick={handleResetCurrent}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs transition-colors flex items-center justify-center gap-1.5"
                  title="Limpiar campos"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>

              <button
                onClick={() => setShowHint(!showHint)}
                className="min-h-[44px] text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition-colors self-end sm:self-auto px-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>{showHint ? 'Ocultar pista' : 'Pista'}</span>
              </button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-700 space-y-1">
                <span className="font-semibold text-zinc-900 block">Pista:</span>
                {currentExercise.blanks.map((b) => (
                  <div key={b.id} className="text-zinc-600 text-[12px]">
                    — <strong>{b.label}:</strong> {b.hint}
                  </div>
                ))}
              </div>
            )}

            {/* Sober feedback message */}
            {currentFeedback.status !== 'idle' && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  currentFeedback.status === 'success'
                    ? 'bg-zinc-50 border-zinc-300 text-zinc-900 font-medium'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-600'
                }`}
              >
                <span className="font-mono text-zinc-900 font-bold">
                  {currentFeedback.status === 'success' ? '✓' : '—'}
                </span>
                <span>{currentFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Navigation to next exercise */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-zinc-500 font-mono">
              {completedExerciseIds.length}/{ETAPA3_EXERCISES.length} superados
            </span>

            {currentIdx < ETAPA3_EXERCISES.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIdx(currentIdx + 1);
                  setShowHint(false);
                }}
                className="min-h-[44px] px-5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>Siguiente ejercicio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoNext}
                className="min-h-[44px] px-5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>Avanzar a Etapa 4: Construir clase</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Synthetic Role & Delimiter Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Función sintáctica
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-900 block mb-1">
                Rol en Processing Java:
              </span>
              <p className="text-zinc-600 leading-relaxed text-xs sm:text-sm">
                {currentExercise.signRoleExplanation}
              </p>
            </div>

            {currentExercise.counterConceptNote && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 space-y-1 text-xs">
                <span className="font-semibold text-zinc-900 block">
                  A tener en cuenta:
                </span>
                <p className="leading-relaxed text-zinc-600">
                  {currentExercise.counterConceptNote}
                </p>
              </div>
            )}

            {/* Note on semicolons in Java */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 text-xs text-zinc-600">
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <Info className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>Punto y coma en Java</span>
              </div>
              <p className="leading-relaxed text-[12px]">
                No todas las líneas terminan con punto y coma. Las cabeceras como <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">class Gato</code> o <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">void dibujar()</code> abren un bloque con llave y <strong>no</strong> llevan punto y coma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
