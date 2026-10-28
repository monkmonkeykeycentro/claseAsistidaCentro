/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StageId, UserProgress, BuilderState, ZoneId } from './types/classStructure';
import { INITIAL_BUILDER_STATE } from './data/stageData';
import { TOPICS_DATA } from './data/topicsData';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { FocusedWorkshopView } from './components/FocusedWorkshopView';
import { TopicsCatalogueModal } from './components/TopicsCatalogueModal';
import { TopicViewer } from './components/TopicViewer';
import { AuthModal } from './components/AuthModal';
import { OopLabView } from './components/oopLab/OopLabView';
import {
  AppUser,
  subscribeToAuth,
  saveUserTopicProgress,
  loadUserTopicProgress,
} from './services/firebase';
import { BookOpen } from 'lucide-react';

const STORAGE_KEY = 'processing_class_structure_progress';
const TOPIC_STORAGE_KEY = 'processing_current_topic_id';

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

type ViewMode = 'home' | 'workshop' | 'topic' | 'oop-lab';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('home');

  const [currentTopicId, setCurrentTopicId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(TOPIC_STORAGE_KEY);
      if (saved && TOPICS_DATA.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'classes';
  });

  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageId>(1);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setIsSyncing(true);
          const cloudData = await loadUserTopicProgress(user.uid, currentTopicId);
          if (cloudData && cloudData.progress) {
            setProgress((prev) => ({
              ...prev,
              ...cloudData.progress,
              stageCompleted: {
                ...prev.stageCompleted,
                ...(cloudData.progress.stageCompleted || {}),
              },
            }));
            if (cloudData.builderState) {
              setSavedBuilderState(cloudData.builderState);
            }
          }
        } catch (e) {
          console.warn('Could not sync initial progress from cloud:', e);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, [currentTopicId]);

  // Save topic change locally
  useEffect(() => {
    try {
      localStorage.setItem(TOPIC_STORAGE_KEY, currentTopicId);
    } catch {
      // Ignore
    }
  }, [currentTopicId]);

  // Save progress changes locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage error
    }
  }, [progress]);

  // Auto-sync progress to Firebase Firestore if logged in
  useEffect(() => {
    if (!currentUser) return;
    const timeout = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveUserTopicProgress(currentUser.uid, currentTopicId, progress, savedBuilderState);
      } catch (err) {
        console.warn('Auto-save progress to cloud error:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [progress, savedBuilderState, currentUser, currentTopicId]);

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
        '¿Deseas reiniciar todo tu progreso y volver al inicio de la Etapa 1 del taller de clases?'
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

  const handleSelectTopicFromCatalogue = (topicId: string) => {
    setCurrentTopicId(topicId);
    if (topicId === 'classes') {
      setActiveView('workshop');
    } else {
      setActiveView('topic');
    }
  };

  const currentTopic =
    TOPICS_DATA.find((t) => t.id === currentTopicId) || TOPICS_DATA[5];

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#181818] flex flex-col font-sans selection:bg-[#D5E35F] selection:text-[#181818]">
      <Header
        currentView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onOpenCatalogue={() => setIsCatalogueOpen(true)}
        onNavigateOopLab={() => setActiveView('oop-lab')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isSyncing={isSyncing}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* VIEW 1: Home View */}
        {activeView === 'home' && (
          <HomeView
            onOpenWorkshop={(stage) => {
              if (stage) setCurrentStage(stage);
              setCurrentTopicId('classes');
              setActiveView('workshop');
            }}
            onSelectTopic={(tId) => {
              setCurrentTopicId(tId);
              if (tId === 'classes') {
                setActiveView('workshop');
              } else {
                setActiveView('topic');
              }
            }}
            onOpenOopLab={() => setActiveView('oop-lab')}
            progress={progress}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onResetProgress={handleResetAllProgress}
          />
        )}

        {/* VIEW 2: Focused Workshop View */}
        {activeView === 'workshop' && (
          <FocusedWorkshopView
            currentStage={currentStage}
            onSelectStage={(st) => setCurrentStage(st)}
            progress={progress}
            onStageComplete={handleStageComplete}
            onSaveStage2Placements={handleSaveStage2Placements}
            onSaveStage3Exercise={handleSaveStage3Exercise}
            savedBuilderState={savedBuilderState}
            onSaveBuilderState={handleSaveBuilderState}
            onResetAllProgress={handleResetAllProgress}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {/* VIEW 3: General Curriculum Topic Viewer */}
        {activeView === 'topic' && (
          <TopicViewer
            topic={currentTopic}
            onNavigateTopic={(tId) => {
              setCurrentTopicId(tId);
              if (tId === 'classes') {
                setActiveView('workshop');
              }
            }}
            onOpenCatalogue={() => setIsCatalogueOpen(true)}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {/* VIEW 4: Laboratorio de Objetos (Pelota & Burbuja) */}
        {activeView === 'oop-lab' && (
          <OopLabView
            onBackToHome={() => setActiveView('home')}
            onOpenCatalogue={() => setIsCatalogueOpen(true)}
          />
        )}
      </main>

      {/* Topics Catalogue Modal */}
      <TopicsCatalogueModal
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        currentTopicId={currentTopicId}
        onSelectTopic={handleSelectTopicFromCatalogue}
        classesProgressCount={
          Object.values(progress.stageCompleted).filter(Boolean).length
        }
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Editorial Footer inspired by Generative Design */}
      <footer className="border-t border-[#DCDDD8] py-8 text-xs text-[#767773] bg-[#EEEDE8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#181818]">Código Creativo</span>
            <span className="text-[#DCDDD8]">/</span>
            <span>CENTRO</span>
            <span className="text-[#DCDDD8]">/</span>
            <span className="text-[#767773]">Processing Java 4.3</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#767773]">
            <button
              onClick={() => setActiveView('home')}
              className="text-[#767773] hover:text-[#181818] cursor-pointer"
            >
              Inicio
            </button>
            <span className="text-[#DCDDD8]">·</span>
            <button
              onClick={() => setIsCatalogueOpen(true)}
              className="text-[#767773] hover:text-[#181818] cursor-pointer"
            >
              Temario ({TOPICS_DATA.length})
            </button>
            <span className="text-[#DCDDD8]">·</span>
            <button
              onClick={() => setActiveView('oop-lab')}
              className="text-[#767773] hover:text-[#4263CF] font-medium cursor-pointer"
            >
              Laboratorio POO
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
