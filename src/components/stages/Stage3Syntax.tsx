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
          message: '¡Sintaxis correcta! Bloque validado con éxito.',
        },
      }));
      onSaveCompletedExercise(currentExercise.id);

      const allIds = ETAPA3_EXERCISES.map((e) => e.id);
      const updatedCompleted = Array.from(
        new Set([...completedExerciseIds, currentExercise.id])
      );
      if (allIds.every((id) => updatedCompleted.includes(id))) {
        onComplete();
      }
    } else {
      setFeedbackState((prev) => ({
        ...prev,
        [currentExercise.id]: {
          status: 'error',
          message: errorDetail || 'Revisa la sintaxis e intenta de nuevo.',
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
    <div className="space-y-8">
      {/* Stage Header */}
      <div className="border-b border-[#E1E7E1] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#407B5D] bg-[#E8EEE8] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              Etapa 03
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#232A24]">
              Completar la sintaxis precisa
            </h2>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-xs text-[#407B5D] font-semibold py-1 bg-[#E8EEE8] px-3 rounded-full">
              <Check className="w-3.5 h-3.5" />
              <span>Sintaxis completada</span>
            </div>
          )}
        </div>
        <p className="text-sm text-[#59645C] mt-2 max-w-2xl leading-relaxed">
          Practica escribir la puntuación y palabras clave exactas que Processing Java requiere: llaves, paréntesis, puntos y coma y tipos de datos.
        </p>
      </div>

      {/* Stepper bar across exercises */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {ETAPA3_EXERCISES.map((ex, idx) => {
            const isDone = completedExerciseIds.includes(ex.id);
            const isCurrent = currentIdx === idx;

            return (
              <button
                key={ex.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setShowHint(false);
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#407B5D] text-white border-[#407B5D] font-bold shadow-xs'
                    : isDone
                    ? 'bg-[#E8EEE8] text-[#407B5D] border-[#E1E7E1]'
                    : 'bg-white text-[#59645C] border-[#E1E7E1] hover:bg-[#E8EEE8]'
                }`}
              >
                <span>{ex.title}</span>
                {isDone && <Check className="w-3 h-3 text-[#407B5D]" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (currentIdx > 0) {
                setCurrentIdx(currentIdx - 1);
                setShowHint(false);
              }
            }}
            disabled={currentIdx === 0}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white border border-[#E1E7E1] hover:bg-[#E8EEE8] disabled:opacity-30 text-[#232A24] transition-colors cursor-pointer shadow-xs"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[#59645C] px-1 font-semibold">
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
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white border border-[#E1E7E1] hover:bg-[#E8EEE8] disabled:opacity-30 text-[#232A24] transition-colors cursor-pointer shadow-xs"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2-Column Resolution View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Exercise Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E1E7E1] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E1E7E1] pb-3">
              <h3 className="text-base font-bold text-[#232A24]">
                {currentExercise.title}
              </h3>
              <span className="text-xs font-mono text-[#407B5D] bg-[#E8EEE8] px-2.5 py-1 rounded-full font-semibold">
                {currentExercise.badge}
              </span>
            </div>

            {/* Prompt */}
            <p className="text-sm font-semibold text-[#232A24] leading-relaxed">
              {currentExercise.prompt}
            </p>

            {/* Code Snippet with Processing Java syntax highlighting & live blanks */}
            <div className="p-4 sm:p-5 bg-[#F7F8F4] rounded-xl border border-[#E1E7E1] font-mono text-xs sm:text-sm text-[#232A24]">
              <div className="flex items-center justify-between text-[11px] text-[#59645C] font-sans uppercase tracking-wider mb-2.5 border-b border-[#E1E7E1] pb-1.5 font-bold">
                <span>Código en Processing:</span>
                <span className="font-mono text-[#59645C]">Processing Java</span>
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
                    <label className="text-xs font-mono text-[#59645C] min-w-36 font-semibold">
                      {blank.label}:
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleInputChange(blank.id, e.target.value)}
                      placeholder={blank.placeholder || 'Escribe aquí...'}
                      className="min-h-[44px] flex-1 bg-white border border-[#E1E7E1] rounded-xl px-3.5 py-2 text-xs font-mono text-[#232A24] placeholder:text-[#59645C]/60 focus:outline-none focus:ring-1 focus:ring-[#407B5D] focus:border-[#407B5D] transition-colors"
                    />
                  </div>
                );
              })}
            </div>

            {/* Action buttons with 44px min touch target */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E1E7E1]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCheckCurrent}
                  className="min-h-[44px] flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Comprobar</span>
                </button>
                <button
                  onClick={handleResetCurrent}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#59645C] text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                  title="Limpiar campos"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>

              <button
                onClick={() => setShowHint(!showHint)}
                className="min-h-[44px] text-xs text-[#59645C] hover:text-[#232A24] flex items-center gap-1.5 transition-colors self-end sm:self-auto px-2 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#407B5D]" />
                <span>{showHint ? 'Ocultar pista' : 'Pista'}</span>
              </button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3.5 bg-[#FFF9EE] rounded-xl border border-[#E6B65A] text-xs text-[#232A24] space-y-1">
                <span className="font-bold text-[#8A6318] block">Pista:</span>
                {currentExercise.blanks.map((b) => (
                  <div key={b.id} className="text-[#59645C] text-[12px]">
                    — <strong>{b.label}:</strong> {b.hint}
                  </div>
                ))}
              </div>
            )}

            {/* Feedback message */}
            {currentFeedback.status !== 'idle' && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  currentFeedback.status === 'success'
                    ? 'bg-[#E8EEE8] border-[#407B5D] text-[#232A24] font-medium'
                    : 'bg-[#FFF9EE] border-[#E6B65A] text-[#232A24]'
                }`}
              >
                <span className="font-mono text-[#407B5D] font-bold">
                  {currentFeedback.status === 'success' ? '✓' : '—'}
                </span>
                <span>{currentFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Navigation to next exercise */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#59645C] font-mono">
              {completedExerciseIds.length}/{ETAPA3_EXERCISES.length} superados
            </span>

            {currentIdx < ETAPA3_EXERCISES.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIdx(currentIdx + 1);
                  setShowHint(false);
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-white hover:bg-[#E8EEE8] border border-[#E1E7E1] text-[#232A24] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Siguiente ejercicio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onGoNext}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Avanzar a Etapa 4: Construir clase</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Synthetic Role & Delimiter Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#59645C]">
            Función sintáctica
          </div>

          <div className="bg-white border border-[#E1E7E1] rounded-2xl p-5 space-y-4 text-xs shadow-xs">
            <div>
              <span className="font-bold text-[#232A24] block mb-1">
                Rol en Processing Java:
              </span>
              <p className="text-[#59645C] leading-relaxed text-xs sm:text-sm">
                {currentExercise.signRoleExplanation}
              </p>
            </div>

            {currentExercise.counterConceptNote && (
              <div className="p-3 bg-[#FFF9EE] border border-[#E6B65A] rounded-xl text-[#232A24] space-y-1 text-xs">
                <span className="font-bold text-[#8A6318] block">
                  A tener en cuenta:
                </span>
                <p className="leading-relaxed text-[#59645C]">
                  {currentExercise.counterConceptNote}
                </p>
              </div>
            )}

            {/* Note on semicolons in Java */}
            <div className="p-3.5 bg-white border border-[#E1E7E1] rounded-xl space-y-1.5 text-xs text-[#59645C]">
              <div className="flex items-center gap-2 text-[#407B5D] font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Punto y coma en Java</span>
              </div>
              <p className="leading-relaxed text-[12px]">
                No todas las líneas terminan con punto y coma. Las cabeceras como <code className="text-[#232A24] font-mono bg-[#E8EEE8] px-1 py-0.5 rounded">class Gato</code> o <code className="text-[#232A24] font-mono bg-[#E8EEE8] px-1 py-0.5 rounded">void dibujar()</code> abren un bloque con llave y <strong>no</strong> llevan punto y coma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
