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
    <div className="bg-[#FFFFFF] border border-[#DCDDD8] p-5 sm:p-6 space-y-5 flex flex-col justify-between">
      {/* 1. Moment Indicator & Step Index */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#DCDDD8] pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#181818] bg-[#EEEDE8] px-2 py-0.5 border border-[#DCDDD8]">
              MOMENTO {momentInfo.step}
            </span>
            <span className="text-[#181818] font-semibold">
              {momentInfo.title}
            </span>
            <span className="text-[#DCDDD8] hidden sm:inline">/</span>
            <span className="text-[#767773] hidden sm:inline text-[11px]">
              {momentInfo.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#767773]">
            <span>ETAPA</span>
            <span className="font-bold text-[#181818] tabular-nums">0{currentStageIdx + 1}</span>
            <span className="text-[#DCDDD8]">/</span>
            <span className="tabular-nums">0{totalStages}</span>
          </div>
        </div>

        {/* Stage Title & Learning Objective */}
        <div className="space-y-1.5 pt-1">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#181818] font-sans">
            {activity.title}
          </h2>
          <div className="text-xs text-[#767773] font-mono leading-relaxed">
            <span className="text-[#181818] font-semibold uppercase">Objetivo:</span> {activity.objective}
          </div>
        </div>

        {/* Pedagogical Explanation */}
        <p className="text-xs sm:text-sm text-[#555652] leading-relaxed font-sans pt-1">
          {activity.explanation}
        </p>

        {/* 2. Challenge / Question Section */}
        {challenge && (
          <div className="p-4 bg-[#EEEDE8] border border-[#DCDDD8] space-y-3 mt-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#767773] border-b border-[#DCDDD8] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#181818]">
                <HelpCircle className="w-3.5 h-3.5 text-[#4263CF]" />
                <span>PREGUNTA DE COMPRENSIÓN</span>
              </div>
              <span>Selecciona una opción</span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#181818] leading-relaxed font-sans">
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
                          ? 'bg-[#181818] text-[#F6F5F0] border-[#181818]'
                          : 'bg-[#FFFFFF] text-[#181818] border-[#4263CF] ring-1 ring-[#4263CF]'
                        : 'bg-[#FFFFFF] hover:border-[#181818] border-[#DCDDD8] text-[#181818]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold ${
                        isSelected && opt.isCorrect
                          ? 'bg-[#D5E35F] text-[#181818] border-[#D5E35F]'
                          : isSelected
                          ? 'bg-[#4263CF] text-white border-[#4263CF]'
                          : 'bg-[#EEEDE8] border-[#DCDDD8] text-[#181818]'
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
                    ? 'bg-[#FFFFFF] border-l-[#4263CF] border border-[#DCDDD8] text-[#181818]'
                    : 'bg-[#FFFFFF] border-l-rose-500 border border-[#DCDDD8] text-[#181818]'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5 font-mono text-xs">
                  {chosenOption.isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-[#4263CF]" />
                      <span className="text-[#4263CF] font-bold">[COMPRENSIÓN CONCEPTUAL VALIDADA]</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-800 font-bold">[DIAGNÓSTICO TÉCNICO DE ERROR]</span>
                    </>
                  )}
                </div>
                <p className="text-[#181818] leading-relaxed">{chosenOption.feedback}</p>
                <div className="pt-2 mt-2 border-t border-[#DCDDD8] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#767773]">
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
                      className="min-h-[28px] px-2.5 py-1 bg-[#EEEDE8] hover:bg-[#DCDDD8] text-[#181818] border border-[#DCDDD8] font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-[#767773]" />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Application Task (unlocked upon correct comprehension) */}
            {activity.applicationTask && (isChallengeCompleted || chosenOption?.isCorrect) && (
              <div className="p-3.5 bg-[#FFFFFF] border-2 border-[#181818] space-y-2 mt-3 font-mono">
                <div className="flex items-center justify-between text-xs font-bold text-[#181818]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#4263CF]" />
                    <span>APLICACIÓN PRÁCTICA DEL CONCEPTO</span>
                  </div>
                  <span className="text-[10px] bg-[#D5E35F] text-[#181818] px-1.5 py-0.5 font-bold uppercase">
                    Comprobación Activa
                  </span>
                </div>
                <p className="text-xs font-sans text-[#181818] leading-relaxed">
                  {activity.applicationTask.instruction}
                </p>
                <div className="text-[11px] text-[#767773] pt-1.5 border-t border-[#DCDDD8] flex items-center justify-between">
                  <span>Esperado: {activity.applicationTask.expectedOutcome}</span>
                </div>
              </div>
            )}

            {/* 3-Level Progressive Analytical Hints */}
            <div className="pt-2 border-t border-[#DCDDD8] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#767773]">
                <span className="flex items-center gap-1 font-semibold text-[#181818]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#4263CF]" />
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
                        ? 'bg-[#181818] text-[#F6F5F0] border-[#181818]'
                        : 'bg-[#FFFFFF] hover:bg-[#EEEDE8] border-[#DCDDD8] text-[#181818]'
                    }`}
                  >
                    <span>Pista 0{lvl}</span>
                    {activeHintLevel === lvl ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {activeHintLevel && (
                <div className="p-3 bg-[#FFFFFF] border border-[#DCDDD8] text-xs text-[#555652] leading-relaxed font-sans">
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
      <div className="pt-4 border-t border-[#DCDDD8] flex items-center justify-between gap-3 font-mono text-xs">
        <button
          onClick={onPrevStage}
          disabled={currentStageIdx === 0}
          className="min-h-[40px] px-3.5 py-1.5 border border-[#DCDDD8] bg-[#FFFFFF] hover:bg-[#EEEDE8] text-[#181818] disabled:opacity-30 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                  ? 'bg-[#4263CF] w-5'
                  : 'bg-[#DCDDD8] hover:bg-[#767773] w-2'
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
                  ? 'bg-[#EEEDE8] text-[#767773] border-[#DCDDD8] cursor-not-allowed opacity-60'
                  : 'bg-[#181818] hover:bg-[#4263CF] text-[#F6F5F0] border-[#181818]'
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
