import { useCallback, useEffect, useState } from 'react';
import { StageId, UserProgress, BuilderState, ZoneId, LessonProgress, ActivityProgress } from '../types/classStructure';
import { INITIAL_BUILDER_STATE } from '../data/stageData';
import {
  AppUser,
  loadUserTopicProgress,
  saveUserTopicProgress,
} from '../services/firebase';

const STORAGE_KEY = 'processing_class_structure_progress';

const DEFAULT_PROGRESS: UserProgress = {
  stageCompleted: { 1: false, 2: false, 3: false, 4: false },
  stage3CompletedExercises: [],
  stage2Placements: {},
  stage4BuilderCustomized: false,
  lessonProgress: {},
  activityProgress: {},
};

export function useLearningProgress(currentUser: AppUser | null, currentTopicId: string) {
  const [progress, setProgress] = useState<UserProgress>(() => readStorage(STORAGE_KEY, DEFAULT_PROGRESS));
  const [savedBuilderState, setSavedBuilderState] = useState<BuilderState>(() =>
    readStorage(`${STORAGE_KEY}_builder`, INITIAL_BUILDER_STATE),
  );
  const [currentStage, setCurrentStage] = useState<StageId>(1);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!currentUser) {
      setIsSyncing(false);
      return;
    }
    setIsSyncing(true);
    loadUserTopicProgress(currentUser.uid, currentTopicId)
      .then((cloudData) => {
        if (!mounted || !cloudData?.progress) return;
        setProgress((previous) => ({
          ...previous,
          ...cloudData.progress,
          stageCompleted: { ...previous.stageCompleted, ...(cloudData.progress.stageCompleted || {}) },
        }));
        if (cloudData.builderState) setSavedBuilderState(cloudData.builderState);
      })
      .catch((error) => console.warn('Could not sync initial progress from cloud:', error))
      .finally(() => {
        if (mounted) setIsSyncing(false);
      });
    return () => { mounted = false; };
  }, [currentUser?.uid, currentTopicId]);

  useEffect(() => {
    writeStorage(STORAGE_KEY, progress);
  }, [progress]);

  useEffect(() => {
    if (!currentUser) return;
    const timeout = window.setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveUserTopicProgress(currentUser.uid, currentTopicId, progress, savedBuilderState);
      } catch (error) {
        console.warn('Auto-save progress to cloud error:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [currentUser, currentTopicId, progress, savedBuilderState]);

  const completeStage = (stage: StageId) => {
    setProgress((previous) => ({
      ...previous,
      stageCompleted: { ...previous.stageCompleted, [stage]: true },
    }));
  };

  const saveStage3Exercise = (exerciseId: string) => {
    setProgress((previous) => previous.stage3CompletedExercises.includes(exerciseId)
      ? previous
      : { ...previous, stage3CompletedExercises: [...previous.stage3CompletedExercises, exerciseId] });
  };

  const saveStage2Placements = (placements: Record<string, ZoneId>) => {
    setProgress((previous) => ({ ...previous, stage2Placements: placements }));
  };

  const saveBuilderState = (state: BuilderState) => {
    setSavedBuilderState(state);
    writeStorage(`${STORAGE_KEY}_builder`, state);
    setProgress((previous) => ({ ...previous, stage4BuilderCustomized: true }));
  };

  const resetAllProgress = () => {
    if (!window.confirm('¿Deseas reiniciar todo tu progreso y volver al inicio de la Etapa 1 del taller de clases?')) return;
    setProgress(DEFAULT_PROGRESS);
    setSavedBuilderState(INITIAL_BUILDER_STATE);
    setCurrentStage(1);
    removeStorage(STORAGE_KEY);
    removeStorage(`${STORAGE_KEY}_builder`);
  };

  const markLessonSectionVisited = useCallback((lessonId: string, sectionId: string, _totalSections: number) => {
    setProgress((previous) => {
      const current: LessonProgress = previous.lessonProgress?.[lessonId] || {
        completedSections: [],
        lastVisitedAt: new Date().toISOString(),
      };
      const completedSections = current.completedSections.includes(sectionId)
        ? current.completedSections
        : [...current.completedSections, sectionId];
      return {
        ...previous,
        lessonProgress: {
          ...previous.lessonProgress,
          [lessonId]: {
            completedSections,
            currentSectionId: sectionId,
            lastVisitedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const saveActivityResult = useCallback((exerciseId: string, result: Omit<ActivityProgress, 'attempts' | 'lastAttemptAt'>) => {
    setProgress((previous) => {
      const current = previous.activityProgress?.[exerciseId];
      return {
        ...previous,
        activityProgress: {
          ...previous.activityProgress,
          [exerciseId]: {
            ...result,
            attempts: (current?.attempts || 0) + 1,
            bestScore: Math.max(current?.bestScore || 0, result.bestScore),
            lastAttemptAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  return {
    progress,
    savedBuilderState,
    currentStage,
    setCurrentStage,
    isSyncing,
    completeStage,
    saveStage3Exercise,
    saveStage2Placements,
    saveBuilderState,
    resetAllProgress,
    markLessonSectionVisited,
    saveActivityResult,
  };
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
}

function removeStorage(key: string): void {
  try { localStorage.removeItem(key); } catch { /* Storage is optional. */ }
}
