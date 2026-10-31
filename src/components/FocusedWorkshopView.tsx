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
      <div className="border-b border-[#E1E7E1] pb-5 space-y-4">
        {/* Back and Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="min-h-[38px] flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#E8EEE8] text-xs font-medium text-[#232A24] border border-[#E1E7E1] rounded-xl transition-colors cursor-pointer shadow-xs"
              title="Volver a la página principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Inicio</span>
            </button>

            <span className="text-[#E1E7E1]">/</span>

            <div className="flex items-center gap-1.5 text-xs text-[#59645C]">
              <span className="text-[#407B5D] font-bold bg-[#E8EEE8] px-2 py-0.5 rounded-full text-[11px]">Tema 06</span>
              <span>·</span>
              <span className="text-[#232A24] font-semibold hidden sm:inline">Anatomía de una Clase (POO)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-[#59645C] bg-white border border-[#E1E7E1] px-3 py-1 rounded-xl shadow-xs">
              {completedCount}/4 etapas completadas ({Math.round((completedCount / 4) * 100)}%)
            </span>

            <button
              onClick={onResetAllProgress}
              className="min-h-[38px] px-3 py-1 text-xs text-[#59645C] hover:text-[#232A24] hover:bg-[#E8EEE8] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reiniciar progreso del taller de clases"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Stages Tab Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {stages.map((st) => {
            const isActive = currentStage === st.id;
            const isDone = progress.stageCompleted[st.id];

            return (
              <button
                key={st.id}
                onClick={() => onSelectStage(st.id)}
                className={`min-h-[40px] flex items-center gap-2 px-4 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-[#407B5D] text-white border-[#407B5D] font-bold shadow-xs'
                    : isDone
                    ? 'bg-[#E8EEE8] hover:bg-[#d8e3d8] text-[#232A24] border-[#E1E7E1] font-medium'
                    : 'bg-[#FFFFFF] hover:bg-[#E8EEE8] text-[#59645C] border-[#E1E7E1]'
                }`}
              >
                <span>{st.label}</span>
                {isDone && (
                  <Check
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#E6B65A]' : 'text-[#407B5D]'}`}
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
        <div className="p-4.5 border border-[#407B5D] bg-[#E8EEE8] rounded-2xl flex items-center justify-between text-xs text-[#232A24] shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#407B5D]" />
            <span className="font-bold text-[#232A24] text-sm">
              ¡Taller de clases completado!
            </span>
            <span className="text-[#59645C]">·</span>
            <span className="text-[#59645C] hidden sm:inline">
              Has dominado declaración, campos, sintaxis y diseño en Processing Java
            </span>
          </div>
          <span className="bg-[#407B5D] text-white font-bold text-xs px-2.5 py-1 rounded-lg shrink-0 shadow-xs">
            4/4 Etapas
          </span>
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
