/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StageId, UserProgress, BuilderState, ZoneId } from './types/classStructure';
import { INITIAL_BUILDER_STATE } from './data/stageData';
import { Header } from './components/Header';
import { Stage1Structure } from './components/stages/Stage1Structure';
import { Stage2Placement } from './components/stages/Stage2Placement';
import { Stage3Syntax } from './components/stages/Stage3Syntax';
import { Stage4Builder } from './components/stages/Stage4Builder';
import { BookOpen } from 'lucide-react';

const STORAGE_KEY = 'processing_class_structure_progress';

const DEFAULT_PROGRESS: UserProgress = {
  stageCompleted: {
    1: false,
    2: false,
    3: false,
    4: false,
  },
  stage3CompletedExercises: [],
  stage2Placements: {},
  stage4BuilderCustomized: false,
};

export default function App() {
  const [currentStage, setCurrentStage] = useState<StageId>(1);
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore JSON error
    }
    return DEFAULT_PROGRESS;
  });

  const [savedBuilderState, setSavedBuilderState] = useState<BuilderState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_builder`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return INITIAL_BUILDER_STATE;
  });

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage error
    }
  }, [progress]);

  const handleStageComplete = (stage: StageId) => {
    setProgress((prev) => ({
      ...prev,
      stageCompleted: {
        ...prev.stageCompleted,
        [stage]: true,
      },
    }));
  };

  const handleSaveStage3Exercise = (exId: string) => {
    setProgress((prev) => {
      if (prev.stage3CompletedExercises.includes(exId)) return prev;
      return {
        ...prev,
        stage3CompletedExercises: [...prev.stage3CompletedExercises, exId],
      };
    });
  };

  const handleSaveStage2Placements = (placements: Record<string, ZoneId>) => {
    setProgress((prev) => ({
      ...prev,
      stage2Placements: placements,
    }));
  };

  const handleSaveBuilderState = (state: BuilderState) => {
    setSavedBuilderState(state);
    try {
      localStorage.setItem(`${STORAGE_KEY}_builder`, JSON.stringify(state));
    } catch {
      // Ignore
    }
    setProgress((prev) => ({
      ...prev,
      stage4BuilderCustomized: true,
    }));
  };

  const handleResetAllProgress = () => {
    if (
      window.confirm(
        '¿Deseas reiniciar todo tu progreso y volver al inicio de la Etapa 1?'
      )
    ) {
      setProgress(DEFAULT_PROGRESS);
      setSavedBuilderState(INITIAL_BUILDER_STATE);
      setCurrentStage(1);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_builder`);
      } catch {
        // Ignore
      }
    }
  };

  const allStagesCompleted =
    progress.stageCompleted[1] &&
    progress.stageCompleted[2] &&
    progress.stageCompleted[3] &&
    progress.stageCompleted[4];

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      <Header
        currentStage={currentStage}
        onSelectStage={(st) => setCurrentStage(st)}
        progress={progress}
        onResetAllProgress={handleResetAllProgress}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Sober, quiet completion summary */}
        {allStagesCompleted && (
          <div className="mb-8 p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-700">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="font-medium text-zinc-900">
                Todas las etapas completadas
              </span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 hidden sm:inline">
                Estructura, organización, sintaxis y construcción de clases
              </span>
            </div>
            <span className="font-mono text-zinc-500 text-[11px] shrink-0">
              4/4 etapas
            </span>
          </div>
        )}

        {/* Stage Content */}
        {currentStage === 1 && (
          <Stage1Structure
            onComplete={() => handleStageComplete(1)}
            isCompleted={progress.stageCompleted[1]}
            onGoNext={() => setCurrentStage(2)}
          />
        )}

        {currentStage === 2 && (
          <Stage2Placement
            onComplete={() => handleStageComplete(2)}
            isCompleted={progress.stageCompleted[2]}
            onGoNext={() => setCurrentStage(3)}
            initialPlacements={progress.stage2Placements}
            onSavePlacements={handleSaveStage2Placements}
          />
        )}

        {currentStage === 3 && (
          <Stage3Syntax
            onComplete={() => handleStageComplete(3)}
            isCompleted={progress.stageCompleted[3]}
            onGoNext={() => setCurrentStage(4)}
            completedExerciseIds={progress.stage3CompletedExercises}
            onSaveCompletedExercise={handleSaveStage3Exercise}
          />
        )}

        {currentStage === 4 && (
          <Stage4Builder
            onComplete={() => handleStageComplete(4)}
            isCompleted={progress.stageCompleted[4]}
            savedState={savedBuilderState}
            onSaveState={handleSaveBuilderState}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 text-xs text-zinc-500 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-700">Estructura de una clase</span>
            <span className="text-zinc-300">·</span>
            <span className="text-zinc-500">Processing Java</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span>Campos → Constructor → Métodos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
