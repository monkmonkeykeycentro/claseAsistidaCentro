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
import { BookOpen, CheckCircle2, Award } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentStage={currentStage}
        onSelectStage={(st) => setCurrentStage(st)}
        progress={progress}
        onResetAllProgress={handleResetAllProgress}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Progress Celebration Banner when all 4 are done */}
        {allStagesCompleted && (
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-500/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-200">
                  ¡Felicitaciones! Has completado todas las etapas de la clase Gato
                </h3>
                <p className="text-xs text-slate-300">
                  Ya dominas la declaración de clases, campos, constructor, parámetros, métodos vacíos y la puntuación de Processing Java.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-3 py-1 bg-emerald-950 rounded-lg border border-emerald-800">
              100% Completado
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
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Estructura de una clase</span>
            <span>· Guía didáctica de sintaxis para Processing Java</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Convención didáctica: Campos → Constructor → Métodos</span>
            <span>·</span>
            <span>Progreso guardado localmente</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
