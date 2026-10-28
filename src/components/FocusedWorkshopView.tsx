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
      <div className="border-b border-[#DCDDD8] pb-5 space-y-4">
        {/* Back and Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="min-h-[38px] flex items-center gap-2 px-3 py-1.5 bg-[#EEEDE8] hover:bg-[#DCDDD8] text-xs font-mono text-[#181818] border border-[#DCDDD8] transition-colors cursor-pointer"
              title="Volver a la página principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← INICIO</span>
            </button>

            <span className="text-[#DCDDD8]">/</span>

            <div className="flex items-center gap-1.5 text-xs text-[#767773] font-mono">
              <span className="text-[#181818] font-bold">[TEMA 06]</span>
              <span>·</span>
              <span className="text-[#181818] hidden sm:inline">Anatomía de una Clase (POO)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-[#767773]">
              {completedCount}/4 ETAPAS ({Math.round((completedCount / 4) * 100)}%)
            </span>

            <button
              onClick={onResetAllProgress}
              className="min-h-[38px] px-2.5 py-1 text-xs text-[#767773] hover:text-[#181818] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reiniciar progreso del taller de clases"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">REINICIAR</span>
            </button>
          </div>
        </div>

        {/* Stages Tab Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
          {stages.map((st) => {
            const isActive = currentStage === st.id;
            const isDone = progress.stageCompleted[st.id];

            return (
              <button
                key={st.id}
                onClick={() => onSelectStage(st.id)}
                className={`min-h-[40px] flex items-center gap-2 px-3.5 py-2 text-xs font-mono transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-[#181818] text-[#F6F5F0] border-[#181818] font-bold'
                    : isDone
                    ? 'bg-[#EEEDE8] hover:bg-[#DCDDD8] text-[#181818] border-[#DCDDD8]'
                    : 'bg-[#F6F5F0] hover:bg-[#EEEDE8] text-[#767773] border-[#DCDDD8]'
                }`}
              >
                <span>{st.label}</span>
                {isDone && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D5E35F]' : 'text-[#4263CF]'}`}
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
        <div className="p-4 border border-[#DCDDD8] bg-[#EEEDE8] flex items-center justify-between text-xs text-[#181818] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4263CF]" />
            <span className="font-bold text-[#181818]">
              TALLER DE CLASES COMPLETADO
            </span>
            <span className="text-[#767773]">·</span>
            <span className="text-[#767773] hidden sm:inline">
              Has dominado declaración, campos, sintaxis y diseño en Processing Java
            </span>
          </div>
          <span className="font-mono text-[#4263CF] font-bold text-xs shrink-0">4/4 ETAPAS</span>
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
