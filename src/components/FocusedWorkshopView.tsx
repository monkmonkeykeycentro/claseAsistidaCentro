import React from 'react';
import { StageId, UserProgress, BuilderState, ZoneId } from '../types/classStructure';
import { Stage1Structure } from './stages/Stage1Structure';
import { Stage2Placement } from './stages/Stage2Placement';
import { Stage3Syntax } from './stages/Stage3Syntax';
import { Stage4Builder } from './stages/Stage4Builder';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';

interface FocusedWorkshopViewProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  progress: UserProgress;
  onStageComplete: (stage: StageId) => void;
  onSaveStage2Placements: (placements: Record<string, ZoneId>) => void;
  onSaveStage3Exercise: (exId: string) => void;
  savedBuilderState: BuilderState;
  onSaveBuilderState: (state: BuilderState) => void;
  onResetAllProgress: () => void;
  onBackToHome: () => void;
}

export const FocusedWorkshopView: React.FC<FocusedWorkshopViewProps> = ({
  currentStage,
  onSelectStage,
  progress,
  onStageComplete,
  onSaveStage2Placements,
  onSaveStage3Exercise,
  savedBuilderState,
  onSaveBuilderState,
  onResetAllProgress,
  onBackToHome,
}) => {
  const stages: Array<{ id: StageId; label: string; short: string }> = [
    { id: 1, label: '1. Reconocer estructura', short: '1. Estructura' },
    { id: 2, label: '2. Ubicar partes', short: '2. Ubicar' },
    { id: 3, label: '3. Completar sintaxis', short: '3. Sintaxis' },
    { id: 4, label: '4. Construir clase', short: '4. Construir' },
  ];

  const allStagesCompleted =
    progress.stageCompleted[1] &&
    progress.stageCompleted[2] &&
    progress.stageCompleted[3] &&
    progress.stageCompleted[4];

  const completedCount = Object.values(progress.stageCompleted).filter(Boolean).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Workshop Navigation Header */}
      <div className="border-b border-zinc-200 pb-5 space-y-4">
        {/* Back and Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="min-h-[44px] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-900 transition-colors cursor-pointer"
              title="Volver a la página principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </button>

            <span className="text-zinc-300">/</span>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <span className="text-zinc-900 font-semibold">TEMA 06</span>
              <span>·</span>
              <span className="text-zinc-700 hidden sm:inline">Anatomía de una Clase (POO)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-zinc-500">
              {completedCount} de 4 etapas ({Math.round((completedCount / 4) * 100)}%)
            </span>

            <button
              onClick={onResetAllProgress}
              className="min-h-[44px] px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
              title="Reiniciar progreso del taller de clases"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reiniciar taller</span>
            </button>
          </div>
        </div>

        {/* Stages Tab Bar */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
          {stages.map((st) => {
            const isActive = currentStage === st.id;
            const isDone = progress.stageCompleted[st.id];

            return (
              <button
                key={st.id}
                onClick={() => onSelectStage(st.id)}
                className={`min-h-[44px] flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-2xs font-semibold'
                    : isDone
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                    : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}
              >
                <span>{st.label}</span>
                {isDone && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-zinc-300' : 'text-zinc-700'}`}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {allStagesCompleted && (
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-900" />
            <span className="font-medium text-zinc-900">
              Taller de Clases completado con éxito
            </span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-600 hidden sm:inline">
              Has dominado declaración, organización de campos, sintaxis y diseño propio en Processing
            </span>
          </div>
          <span className="font-mono text-zinc-500 text-[11px] shrink-0">4/4 etapas</span>
        </div>
      )}

      {/* Active Stage Component */}
      <div className="pt-2">
        {currentStage === 1 && (
          <Stage1Structure
            onComplete={() => onStageComplete(1)}
            isCompleted={progress.stageCompleted[1]}
            onGoNext={() => onSelectStage(2)}
          />
        )}

        {currentStage === 2 && (
          <Stage2Placement
            onComplete={() => onStageComplete(2)}
            isCompleted={progress.stageCompleted[2]}
            onGoNext={() => onSelectStage(3)}
            initialPlacements={progress.stage2Placements}
            onSavePlacements={onSaveStage2Placements}
          />
        )}

        {currentStage === 3 && (
          <Stage3Syntax
            onComplete={() => onStageComplete(3)}
            isCompleted={progress.stageCompleted[3]}
            onGoNext={() => onSelectStage(4)}
            completedExerciseIds={progress.stage3CompletedExercises}
            onSaveCompletedExercise={onSaveStage3Exercise}
          />
        )}

        {currentStage === 4 && (
          <Stage4Builder
            onComplete={() => onStageComplete(4)}
            isCompleted={progress.stageCompleted[4]}
            savedState={savedBuilderState}
            onSaveState={onSaveBuilderState}
          />
        )}
      </div>
    </div>
  );
};
