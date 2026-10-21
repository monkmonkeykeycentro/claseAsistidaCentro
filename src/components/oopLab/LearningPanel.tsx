import React, { useState } from 'react';
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

const MOMENT_LABELS: Record<LearningMoment, { title: string; subtitle: string }> = {
  observe: { title: '1. Observar', subtitle: 'Reconocer el objeto y sus rasgos' },
  describe: { title: '2. Describir', subtitle: 'Propiedades vs Comportamientos' },
  'build-class': { title: '3. Construir Clase', subtitle: 'Sintaxis canónica de Processing' },
  fields: { title: '3. Construir Campos', subtitle: 'Tipos de datos y memoria' },
  constructor: { title: '3. Construir Constructor', subtitle: 'Inicialización de variables' },
  methods: { title: '3. Construir Métodos', subtitle: 'Acciones y parámetros' },
  'method-explorer': { title: '4. Experimentar', subtitle: 'Llamadas a métodos y efectos' },
  'instances-arrays': { title: '5. Aplicar Arreglos', subtitle: 'Gestión de múltiples objetos' },
  'free-lab': { title: 'Laboratorio Libre', subtitle: 'Exploración y exportación' },
};

export const LearningPanel: React.FC<LearningPanelProps> = ({
  activity,
  totalStages,
  currentStageIdx,
  onSelectStageIdx,
  onNextStage,
  onPrevStage,
  onChallengeAnswered,
}) => {
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [activeHintLevel, setActiveHintLevel] = useState<1 | 2 | 3 | null>(null);

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
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs flex flex-col justify-between">
      {/* 1. Moment Indicator & Step Counter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md">
              {momentInfo.title}
            </span>
            <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
              {momentInfo.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs text-zinc-500">
            <span className="font-bold text-zinc-950 tabular-nums">{currentStageIdx + 1}</span>
            <span>/</span>
            <span className="tabular-nums">{totalStages}</span>
          </div>
        </div>

        {/* Stage Title & Learning Objective */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
            {activity.title}
          </h2>
          <div className="text-xs text-zinc-500 font-medium">
            <strong>Objetivo:</strong> {activity.objective}
          </div>
        </div>

        {/* Pedagogical Explanation */}
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
          {activity.explanation}
        </p>

        {/* 2. Challenge / Question if available */}
        {challenge && (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 pt-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
              <HelpCircle className="w-4 h-4 text-zinc-800 shrink-0" />
              <span>Pregunta de comprensión</span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-zinc-900 leading-relaxed">
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
                    className={`w-full p-3 rounded-lg border text-left text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-amber-50 text-amber-950 border-amber-300'
                        : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback */}
            {showFeedback && chosenOption && (
              <div
                className={`p-3.5 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-150 ${
                  chosenOption.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  {chosenOption.isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Respuesta Correcta</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Revisemos este concepto:</span>
                    </>
                  )}
                </div>
                <p>{chosenOption.feedback}</p>
              </div>
            )}

            {/* 3-Level Progressive Hints */}
            <div className="pt-2 border-t border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1 font-medium text-zinc-700">
                  <Lightbulb className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Pistas de apoyo (3 niveles):</span>
                </span>
                <span className="text-[11px] text-zinc-400">Consulta solo si lo necesitas</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setActiveHintLevel(activeHintLevel === 1 ? null : 1)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    activeHintLevel === 1
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <span>Pista 1: Concepto</span>
                  {activeHintLevel === 1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setActiveHintLevel(activeHintLevel === 2 ? null : 2)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    activeHintLevel === 2
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <span>Pista 2: Elementos</span>
                  {activeHintLevel === 2 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setActiveHintLevel(activeHintLevel === 3 ? null : 3)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    activeHintLevel === 3
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <span>Pista 3: Ejemplo</span>
                  {activeHintLevel === 3 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {activeHintLevel && (
                <div className="p-3 bg-white rounded-lg border border-zinc-200 text-xs text-zinc-700 leading-relaxed font-sans animate-in fade-in duration-150">
                  {activeHintLevel === 1 && challenge.hints.hint1}
                  {activeHintLevel === 2 && challenge.hints.hint2}
                  {activeHintLevel === 3 && challenge.hints.hint3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Stage Stepper & Bottom Navigation */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
        <button
          onClick={onPrevStage}
          disabled={currentStageIdx === 0}
          className="min-h-[40px] px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Etapa anterior</span>
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1">
          {Array.from({ length: totalStages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectStageIdx(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === currentStageIdx ? 'bg-zinc-950 w-5' : 'bg-zinc-300 hover:bg-zinc-500'
              }`}
              title={`Ir a etapa ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={onNextStage}
          disabled={currentStageIdx === totalStages - 1}
          className="min-h-[40px] px-4 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Siguiente etapa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
