import React, { useState, useEffect } from 'react';
import { StageActivity, LearningMoment } from '../../types/oopLab';
import {
  HelpCircle,
  Lightbulb,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface LearningPanelProps {
  activity: StageActivity;
  totalStages: number;
  currentStageIdx: number;
  onSelectStageIdx: (idx: number) => void;
  onNextStage: () => void;
  onPrevStage: () => void;
  onChallengeAnswered: (challengeId: string, isCorrect: boolean) => void;
  isChallengeCompleted?: boolean;
}

const MOMENT_LABELS: Record<LearningMoment, { step: string; title: string; subtitle: string }> = {
  observe: { step: '01', title: 'Observar', subtitle: 'Reconocer el objeto y sus cualidades visuales' },
  describe: { step: '02', title: 'Describir', subtitle: 'Propiedades espaciales vs Acciones' },
  'build-class': { step: '03', title: 'Construir Clase', subtitle: 'Sintaxis canónica en Processing' },
  fields: { step: '03', title: 'Construir Campos', subtitle: 'Tipos de datos y memoria' },
  constructor: { step: '03', title: 'Construir Constructor', subtitle: 'Inicialización de variables' },
  methods: { step: '03', title: 'Construir Métodos', subtitle: 'Acciones y parámetros' },
  'method-explorer': { step: '04', title: 'Experimentar', subtitle: 'Llamadas a métodos y mutación de estado' },
  'instances-arrays': { step: '05', title: 'Aplicar Arreglos', subtitle: 'Gestión colectiva de múltiples objetos' },
  'free-lab': { step: '05', title: 'Laboratorio Libre', subtitle: 'Exploración y exportación .pde' },
};

export const LearningPanel: React.FC<LearningPanelProps> = ({
  activity,
  totalStages,
  currentStageIdx,
  onSelectStageIdx,
  onNextStage,
  onPrevStage,
  onChallengeAnswered,
  isChallengeCompleted = false,
}) => {
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [activeHintLevel, setActiveHintLevel] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    setSelectedOptId(null);
    setShowFeedback(false);
    setActiveHintLevel(null);
  }, [activity.id, currentStageIdx]);

  const momentInfo = MOMENT_LABELS[activity.moment];
  const challenge = activity.challenge;

  const handleSelectOption = (optId: string) => {
    setSelectedOptId(optId);
    setShowFeedback(true);
    const chosen = challenge?.options.find((o) => o.id === optId);
    if (chosen && challenge) {
      onChallengeAnswered(challenge.id, chosen.isCorrect);
    }
  };

  const chosenOption = challenge?.options.find((o) => o.id === selectedOptId);

  return (
    <div className="bg-[#FFFFFF] border border-[#DEDDD7] p-5 sm:p-6 space-y-5 flex flex-col justify-between">
      {/* 1. Moment Indicator & Step Index */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#DEDDD7] pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#141414] bg-[#F7F6F1] px-2 py-0.5 border border-[#DEDDD7]">
              MOMENTO {momentInfo.step}
            </span>
            <span className="text-[#141414] font-semibold">
              {momentInfo.title}
            </span>
            <span className="text-[#DEDDD7] hidden sm:inline">/</span>
            <span className="text-[#626262] hidden sm:inline text-[11px]">
              {momentInfo.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#626262]">
            <span>ETAPA</span>
            <span className="font-bold text-[#141414] tabular-nums">0{currentStageIdx + 1}</span>
            <span className="text-[#DEDDD7]">/</span>
            <span className="tabular-nums">0{totalStages}</span>
          </div>
        </div>

        {/* Stage Title & Learning Objective */}
        <div className="space-y-1.5 pt-1">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#141414] font-sans">
            {activity.title}
          </h2>
          <div className="text-xs text-[#626262] font-mono leading-relaxed">
            <span className="text-[#141414] font-semibold uppercase">Objetivo:</span> {activity.objective}
          </div>
        </div>

        {/* Pedagogical Explanation */}
        <p className="text-xs sm:text-sm text-[#626262] leading-relaxed font-sans pt-1">
          {activity.explanation}
        </p>

        {/* 2. Challenge / Question Section */}
        {challenge && (
          <div className="p-4 bg-[#F7F6F1] border border-[#DEDDD7] space-y-3 mt-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#626262] border-b border-[#DEDDD7] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#141414]">
                <HelpCircle className="w-3.5 h-3.5 text-[#2868D9]" />
                <span>PREGUNTA DE COMPRENSIÓN</span>
              </div>
              <span>Selecciona una opción</span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#141414] leading-relaxed font-sans">
              {challenge.question}
            </p>

            {/* Multiple Choice Options */}
            <div className="space-y-2 pt-1 font-sans">
              {challenge.options.map((opt, idx) => {
                const isSelected = selectedOptId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3 border text-left text-xs transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-[#141414] text-[#F7F6F1] border-[#141414]'
                          : 'bg-[#FFFFFF] text-[#141414] border-[#2868D9] ring-1 ring-[#2868D9]'
                        : 'bg-[#FFFFFF] hover:border-[#141414] border-[#DEDDD7] text-[#141414]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold ${
                        isSelected && opt.isCorrect
                          ? 'bg-[#D9AA3D] text-[#141414] border-[#D9AA3D]'
                          : isSelected
                          ? 'bg-[#2868D9] text-white border-[#2868D9]'
                          : 'bg-[#F7F6F1] border-[#DEDDD7] text-[#141414]'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback Block */}
            {showFeedback && chosenOption && (
              <div
                className={`p-3.5 border-l-4 text-xs leading-relaxed font-sans ${
                  chosenOption.isCorrect
                    ? 'bg-[#FFFFFF] border-l-[#2868D9] border border-[#DEDDD7] text-[#141414]'
                    : 'bg-[#FFFFFF] border-l-[#D34E43] border border-[#DEDDD7] text-[#141414]'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5 font-mono text-xs">
                  {chosenOption.isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-[#2868D9]" />
                      <span className="text-[#2868D9] font-bold">[COMPRENSIÓN CONCEPTUAL VALIDADA]</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#D34E43]" />
                      <span className="text-[#D34E43] font-bold">[DIAGNÓSTICO TÉCNICO DE ERROR]</span>
                    </>
                  )}
                </div>
                <p className="text-[#141414] leading-relaxed">{chosenOption.feedback}</p>
                <div className="pt-2 mt-2 border-t border-[#DEDDD7] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#626262]">
                    {chosenOption.isCorrect
                      ? 'Código desbloqueado e integrado en el editor'
                      : 'Reevalúa la arquitectura y selecciona la respuesta técnica adecuada'}
                  </span>
                  {!chosenOption.isCorrect && (
                    <button
                      onClick={() => {
                        setSelectedOptId(null);
                        setShowFeedback(false);
                      }}
                      className="min-h-[28px] px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#141414] border border-[#DEDDD7] font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-[#626262]" />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Application Task (unlocked upon correct comprehension) */}
            {activity.applicationTask && (isChallengeCompleted || chosenOption?.isCorrect) && (
              <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#141414] space-y-2 mt-3 font-mono">
                <div className="flex items-center justify-between text-xs font-bold text-[#141414]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#2868D9]" />
                    <span>APLICACIÓN PRÁCTICA DEL CONCEPTO</span>
                  </div>
                  <span className="text-[10px] bg-[#D9AA3D] text-[#141414] px-1.5 py-0.5 font-bold uppercase">
                    Comprobación Activa
                  </span>
                </div>
                <p className="text-xs font-sans text-[#141414] leading-relaxed">
                  {activity.applicationTask.instruction}
                </p>
                <div className="text-[11px] text-[#626262] pt-1.5 border-t border-[#DEDDD7] flex items-center justify-between">
                  <span>Esperado: {activity.applicationTask.expectedOutcome}</span>
                </div>
              </div>
            )}

            {/* 3-Level Progressive Analytical Hints */}
            <div className="pt-2 border-t border-[#DEDDD7] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#626262]">
                <span className="flex items-center gap-1 font-semibold text-[#141414]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#2868D9]" />
                  <span>Pistas analíticas de ingeniería (3 niveles):</span>
                </span>
                <span className="text-[11px]">Consultar deducción</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveHintLevel(activeHintLevel === lvl ? null : (lvl as 1 | 2 | 3))}
                    className={`px-2 py-1 text-[11px] font-mono border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      activeHintLevel === lvl
                        ? 'bg-[#141414] text-[#F7F6F1] border-[#141414]'
                        : 'bg-[#FFFFFF] hover:bg-[#F7F6F1] border-[#DEDDD7] text-[#141414]'
                    }`}
                  >
                    <span>Pista 0{lvl}</span>
                    {activeHintLevel === lvl ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {activeHintLevel && (
                <div className="p-3 bg-[#FFFFFF] border border-[#DEDDD7] text-xs text-[#626262] leading-relaxed font-sans">
                  {activeHintLevel === 1 && challenge.hints.hint1}
                  {activeHintLevel === 2 && challenge.hints.hint2}
                  {activeHintLevel === 3 && challenge.hints.hint3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Stage Stepper & Bottom Navigation with Strict Gating */}
      <div className="pt-4 border-t border-[#DEDDD7] flex items-center justify-between gap-3 font-mono text-xs">
        <button
          onClick={onPrevStage}
          disabled={currentStageIdx === 0}
          className="min-h-[40px] px-3.5 py-1.5 border border-[#DEDDD7] bg-[#FFFFFF] hover:bg-[#F7F6F1] text-[#141414] disabled:opacity-30 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Etapa anterior</span>
        </button>

        {/* Step Ticks */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[180px] py-1">
          {Array.from({ length: totalStages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectStageIdx(i)}
              className={`h-2 transition-all cursor-pointer ${
                i === currentStageIdx
                  ? 'bg-[#2868D9] w-5'
                  : 'bg-[#DEDDD7] hover:bg-[#626262] w-2'
              }`}
              title={`Ir a etapa ${i + 1}`}
            />
          ))}
        </div>

        {(() => {
          const hasUnsolvedChallenge = challenge && !isChallengeCompleted && !chosenOption?.isCorrect;

          return (
            <button
              onClick={onNextStage}
              disabled={currentStageIdx === totalStages - 1 || Boolean(hasUnsolvedChallenge)}
              className={`min-h-[40px] px-4 py-1.5 font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
                hasUnsolvedChallenge
                  ? 'bg-[#F7F6F1] text-[#626262] border-[#DEDDD7] cursor-not-allowed opacity-60'
                  : 'bg-[#141414] hover:bg-[#2868D9] text-[#F7F6F1] border-[#141414]'
              }`}
              title={hasUnsolvedChallenge ? 'Resuelve el reto analítico para avanzar a la siguiente etapa' : 'Avanzar a la siguiente etapa'}
            >
              <span>{hasUnsolvedChallenge ? 'Resuelve el reto' : 'Siguiente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          );
        })()}
      </div>
    </div>
  );
};
