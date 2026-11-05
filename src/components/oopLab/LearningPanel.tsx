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
    <div className="bg-[#FFFFFF] border border-[#DCE7F2] rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-xs">
      {/* 1. Moment Indicator & Step Index */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#DCE7F2] pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#006699] bg-[#E2EEF8] px-2.5 py-0.5 rounded-md">
              Momento {momentInfo.step}
            </span>
            <span className="text-[#0C2233] font-bold">
              {momentInfo.title}
            </span>
            <span className="text-[#DCE7F2] hidden sm:inline">/</span>
            <span className="text-[#4A6076] hidden sm:inline text-xs">
              {momentInfo.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A6076]">
            <span>Etapa</span>
            <span className="font-bold text-[#0C2233] bg-[#F4F8FB] px-1.5 py-0.5 rounded border border-[#DCE7F2]">
              0{currentStageIdx + 1}
            </span>
            <span className="text-[#DCE7F2]">/</span>
            <span>0{totalStages}</span>
          </div>
        </div>

        {/* Stage Title & Learning Objective */}
        <div className="space-y-1.5 pt-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0C2233]">
            {activity.title}
          </h2>
          <div className="text-xs text-[#4A6076] leading-relaxed">
            <span className="text-[#0C2233] font-bold uppercase tracking-wide">Objetivo:</span> {activity.objective}
          </div>
        </div>

        {/* Pedagogical Explanation */}
        <p className="text-sm text-[#4A6076] leading-relaxed pt-1">
          {activity.explanation}
        </p>

        {/* 2. Challenge / Question Section */}
        {challenge && (
          <div className="p-4 sm:p-5 bg-[#F4F8FB] border border-[#DCE7F2] rounded-2xl space-y-3.5 mt-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#4A6076] border-b border-[#DCE7F2] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#006699]">
                <HelpCircle className="w-4 h-4 text-[#006699]" />
                <span>Pregunta de comprensión</span>
              </div>
              <span className="font-medium">Selecciona una respuesta</span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-[#0C2233] leading-relaxed">
              {challenge.question}
            </p>

            {/* Multiple Choice Options */}
            <div className="space-y-2 pt-1">
              {challenge.options.map((opt, idx) => {
                const isSelected = selectedOptId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-[#E2EEF8] text-[#0C2233] border-[#006699] ring-1 ring-[#006699] font-medium'
                          : 'bg-rose-50/50 text-[#0C2233] border-rose-300 ring-1 ring-rose-300'
                        : 'bg-[#FFFFFF] hover:border-[#006699] hover:bg-[#E2EEF8]/30 border-[#DCE7F2] text-[#0C2233]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isSelected && opt.isCorrect
                          ? 'bg-[#006699] text-white border-[#006699]'
                          : isSelected
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-[#F4F8FB] border-[#DCE7F2] text-[#4A6076]'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed flex-1 pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback Block */}
            {showFeedback && chosenOption && (
              <div
                className={`p-4 rounded-xl border-l-4 text-xs sm:text-sm leading-relaxed ${
                  chosenOption.isCorrect
                    ? 'bg-[#E2EEF8]/40 border-l-[#006699] border border-[#DCE7F2] text-[#0C2233]'
                    : 'bg-rose-50/40 border-l-[#D34E43] border border-[#DCE7F2] text-[#0C2233]'
                }`}
              >
                <div className="font-bold mb-1.5 flex items-center gap-1.5 text-xs">
                  {chosenOption.isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-[#006699]" />
                      <span className="text-[#006699] font-bold">¡Excelente comprensión conceptual!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#D34E43]" />
                      <span className="text-[#D34E43] font-bold">Revisión analítica de la respuesta:</span>
                    </>
                  )}
                </div>
                <p className="text-[#0C2233] leading-relaxed">{chosenOption.feedback}</p>
                <div className="pt-2.5 mt-2.5 border-t border-[#DCE7F2] flex items-center justify-between">
                  <span className="text-xs text-[#4A6076]">
                    {chosenOption.isCorrect
                      ? 'Código desbloqueado e integrado en el editor'
                      : 'Reevalúa la arquitectura y selecciona la respuesta adecuada'}
                  </span>
                  {!chosenOption.isCorrect && (
                    <button
                      onClick={() => {
                        setSelectedOptId(null);
                        setShowFeedback(false);
                      }}
                      className="min-h-[30px] px-3 py-1 bg-[#FFFFFF] hover:bg-[#E2EEF8]/40 text-[#0C2233] border border-[#DCE7F2] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3 text-[#4A6076]" />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Application Task (unlocked upon correct comprehension) */}
            {activity.applicationTask && (isChallengeCompleted || chosenOption?.isCorrect) && (
              <div className="p-4 bg-[#FFFFFF] border-2 border-[#006699] rounded-xl space-y-2 mt-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#0C2233]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006699]" />
                    <span>Aplicación práctica del concepto</span>
                  </div>
                  <span className="text-[10px] bg-[#E2EEF8] text-[#006699] px-2 py-0.5 rounded-md font-bold uppercase">
                    Comprobación activa
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#0C2233] leading-relaxed">
                  {activity.applicationTask.instruction}
                </p>
                <div className="text-xs text-[#4A6076] pt-2 border-t border-[#DCE7F2] flex items-center justify-between">
                  <span>Esperado: {activity.applicationTask.expectedOutcome}</span>
                </div>
              </div>
            )}

            {/* 3-Level Progressive Analytical Hints */}
            <div className="pt-2 border-t border-[#DCE7F2] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#4A6076]">
                <span className="flex items-center gap-1.5 font-bold text-[#0C2233]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#E6B65A]" />
                  <span>Pistas analíticas (3 niveles):</span>
                </span>
                <span className="text-xs">Consultar deducción</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveHintLevel(activeHintLevel === lvl ? null : (lvl as 1 | 2 | 3))}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      activeHintLevel === lvl
                        ? 'bg-[#006699] text-white border-[#006699] font-bold shadow-xs'
                        : 'bg-[#FFFFFF] hover:bg-[#E2EEF8]/40 border-[#DCE7F2] text-[#0C2233]'
                    }`}
                  >
                    <span>Pista 0{lvl}</span>
                    {activeHintLevel === lvl ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {activeHintLevel && (
                <div className="p-3.5 bg-[#FFFFFF] border border-[#DCE7F2] rounded-xl text-xs sm:text-sm text-[#4A6076] leading-relaxed shadow-2xs">
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
      <div className="pt-4 border-t border-[#DCE7F2] flex items-center justify-between gap-3 text-xs">
        <button
          onClick={onPrevStage}
          disabled={currentStageIdx === 0}
          className="min-h-[40px] px-3.5 py-1.5 border border-[#DCE7F2] bg-[#FFFFFF] hover:bg-[#E2EEF8]/40 text-[#0C2233] disabled:opacity-30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Etapa anterior</span>
        </button>

        {/* Step Ticks */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[180px] py-1">
          {Array.from({ length: totalStages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectStageIdx(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === currentStageIdx
                  ? 'bg-[#006699] w-6'
                  : 'bg-[#DCE7F2] hover:bg-[#4A6076] w-2.5'
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
              className={`min-h-[40px] px-5 py-1.5 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                hasUnsolvedChallenge
                  ? 'bg-[#F4F8FB] text-[#4A6076] border-[#DCE7F2] cursor-not-allowed opacity-60'
                  : 'bg-[#006699] hover:bg-[#00507A] text-white border-[#006699] shadow-xs active:scale-98'
              }`}
              title={hasUnsolvedChallenge ? 'Resuelve la pregunta de comprensión para avanzar a la siguiente etapa' : 'Avanzar a la siguiente etapa'}
            >
              <span>{hasUnsolvedChallenge ? 'Resuelve la pregunta' : 'Siguiente'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          );
        })()}
      </div>
    </div>
  );
};
