/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StageId, UserProgress, BuilderState, ZoneId } from './types/classStructure';
import { INITIAL_BUILDER_STATE } from './data/stageData';
import { TOPICS_DATA, TopicItem } from './data/topicsData';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { FocusedWorkshopView } from './components/FocusedWorkshopView';
import { TopicsCatalogueModal } from './components/TopicsCatalogueModal';
import { TopicViewer } from './components/TopicViewer';
import { AuthModal } from './components/AuthModal';
import { OopLabView } from './components/oopLab/OopLabView';
import { PilotExercisesView } from './components/pilot/PilotExercisesView';
import { UnitActivitiesView } from './components/curriculum/UnitActivitiesView';
import {
  AppUser,
  subscribeToAuth,
  saveUserTopicProgress,
  loadUserTopicProgress,
  isUserAdmin,
} from './services/firebase';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  subscribeToSiteContent,
  getAllTopicsFromCmsOrFallback,
} from './services/cmsService';
import { CmsSiteContentCombined } from './types/cms';
import { BookOpen, Eye, X, Settings } from 'lucide-react';

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

type ViewMode = 'home' | 'workshop' | 'topic' | 'oop-lab' | 'pilot' | 'units' | 'admin';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const [siteContent, setSiteContent] = useState<CmsSiteContentCombined | null>(null);
  const [isStudentPreviewMode, setIsStudentPreviewMode] = useState<boolean>(false);

  const [currentTopicId, setCurrentTopicId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(TOPIC_STORAGE_KEY);
      if (saved && /^[a-zA-Z0-9_-]+$/.test(saved)) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'classes';
  });

  const [allCurriculumTopics, setAllCurriculumTopics] = useState<TopicItem[]>(TOPICS_DATA);
  const [curriculumIncludesDrafts, setCurriculumIncludesDrafts] = useState(false);
  const [isCurriculumLoading, setIsCurriculumLoading] = useState(true);


  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageId>(1);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const canAdmin = isUserAdmin(currentUser);
  const displayedTopics = curriculumIncludesDrafts && !canAdmin ? [] : allCurriculumTopics;
  const dynamicTopic = displayedTopics.find((topic) => topic.id === currentTopicId) || null;
  const [isSyncing, setIsSyncing] = useState(false);

  const [selectedCurriculumUnit, setSelectedCurriculumUnit] = useState<'u1' | 'u2' | 'u3'>('u1');
  const [selectedCurriculumExercise, setSelectedCurriculumExercise] = useState<string | undefined>(undefined);

  const handleNavigateAdmin = () => {
    if (!canAdmin) return;
    setActiveView('admin');
    window.location.hash = '#admin';
  };

  const handleExitAdmin = () => {
    setActiveView('home');
    if (window.location.hash === '#admin' || window.location.hash === '#cms') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }
  };

  // URL route detection (#admin, #cms, ?admin, /admin, #unidades, #u1, #u2, #u3) and keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = new URLSearchParams(window.location.search.toLowerCase());
      const pathname = window.location.pathname.toLowerCase();

      if (canAdmin && (
        hash === '#admin' ||
        hash === '#cms' ||
        search.has('admin') ||
        search.has('cms') ||
        pathname.endsWith('/admin') ||
        pathname.endsWith('/cms')
      )) {
        setActiveView('admin');
        return;
      }

      if (
        hash === '#unidades' ||
        hash === '#unidad-1' ||
        hash === '#unidad-2' ||
        hash === '#unidad-3' ||
        hash === '#u1' ||
        hash === '#u2' ||
        hash === '#u3' ||
        hash === '#actividades' ||
        search.has('units') ||
        search.has('unidades')
      ) {
        if (hash === '#unidad-2' || hash === '#u2') setSelectedCurriculumUnit('u2');
        else if (hash === '#unidad-3' || hash === '#u3') setSelectedCurriculumUnit('u3');
        else if (hash === '#unidad-1' || hash === '#u1') setSelectedCurriculumUnit('u1');
        setActiveView('units');
        return;
      }

      if (
        hash === '#exploraciones' ||
        hash === '#piloto' ||
        hash === '#coordenadas' ||
        hash === '#condicionales' ||
        hash === '#audiovisual' ||
        search.has('pilot') ||
        search.has('exploraciones')
      ) {
        setActiveView('pilot');
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (canAdmin && (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleNavigateAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canAdmin]);

  useEffect(() => {
    if (!canAdmin) {
      setActiveView((view) => view === 'admin' ? 'home' : view);
      setIsStudentPreviewMode(false);
    }
  }, [canAdmin]);

  // Read published site texts without attempting writes from public sessions.
  useEffect(() => {
    let isMounted = true;
    const unsubscribeSite = subscribeToSiteContent((content) => {
      if (isMounted) setSiteContent(content);
    });

    return () => {
      isMounted = false;
      unsubscribeSite();
    };
  }, []);

  // Refresh dynamic topic data from CMS whenever topic or view changes
  useEffect(() => {
    let isMounted = true;
    setIsCurriculumLoading(true);
    getAllTopicsFromCmsOrFallback(canAdmin && isStudentPreviewMode).then((list) => {
      if (isMounted) {
        setAllCurriculumTopics(list);
        setCurriculumIncludesDrafts(canAdmin && isStudentPreviewMode);

      }
    }).catch((error) => {
      console.warn('No se pudo cargar la vista previa del CMS:', error);
      if (isMounted) setAllCurriculumTopics([]);
    }).finally(() => {
      if (isMounted) setIsCurriculumLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isStudentPreviewMode, activeView, canAdmin]);

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

  // Keep one identity subscription; changing lessons must not reset admin access.
  useEffect(() => subscribeToAuth(setCurrentUser), []);

  useEffect(() => {
    let isMounted = true;
    if (!currentUser) {
      setIsSyncing(false);
      return;
    }
    setIsSyncing(true);
    loadUserTopicProgress(currentUser.uid, currentTopicId).then((cloudData) => {
      if (!isMounted || !cloudData?.progress) return;
      setProgress((prev) => ({
        ...prev,
        ...cloudData.progress,
        stageCompleted: { ...prev.stageCompleted, ...(cloudData.progress.stageCompleted || {}) },
      }));
      if (cloudData.builderState) setSavedBuilderState(cloudData.builderState);
    }).catch((error) => {
      console.warn('Could not sync initial progress from cloud:', error);
    }).finally(() => {
      if (isMounted) setIsSyncing(false);
    });
    return () => { isMounted = false; };
  }, [currentUser?.uid, currentTopicId]);

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
    <div className="min-h-screen bg-[#F7F8F4] text-[#232A24] flex flex-col font-sans selection:bg-[#E8EEE8] selection:text-[#232A24]">
      {/* Student Preview Mode Banner */}
      {canAdmin && isStudentPreviewMode && (
        <div className="bg-[#407B5D] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#E6B65A]" />
              <span>Modo &ldquo;Vista Previa como Estudiante&rdquo; activo: revisando contenidos en borrador.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNavigateAdmin}
                className="underline hover:text-[#E8EEE8] cursor-pointer text-xs"
              >
                Volver al CMS
              </button>
              <button
                onClick={() => setIsStudentPreviewMode(false)}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded flex items-center gap-1 cursor-pointer"
                title="Cerrar vista previa"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        currentView={activeView === 'admin' && !canAdmin ? 'home' : activeView}
        onNavigateHome={() => setActiveView('home')}
        onOpenCatalogue={() => setIsCatalogueOpen(true)}
        onNavigateOopLab={() => setActiveView('oop-lab')}
        onNavigatePilot={() => setActiveView('pilot')}
        onNavigateUnits={() => {
          setSelectedCurriculumExercise(undefined);
          setActiveView('units');
          window.location.hash = '#unidades';
        }}
        onNavigateAdmin={canAdmin ? handleNavigateAdmin : undefined}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isSyncing={isSyncing}
        topicCount={displayedTopics.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* VIEW 0: CMS Admin Dashboard */}
        {activeView === 'admin' && canAdmin && (
          <AdminDashboard
            currentUser={currentUser}
            onExitAdmin={handleExitAdmin}
            onPreviewAsStudent={() => {
              setIsStudentPreviewMode(true);
              setActiveView('home');
            }}
            onOpenExerciseInRunner={(uId, exId) => {
              setSelectedCurriculumUnit(uId);
              setSelectedCurriculumExercise(exId);
              setActiveView('units');
              window.location.hash = `#${exId}`;
            }}
          />
        )}

        {/* VIEW 1: Home View */}
        {(activeView === 'home' || (activeView === 'admin' && !canAdmin)) && (
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
            onOpenPilot={() => setActiveView('pilot')}
            onOpenUnits={(unitId, exId) => {
              if (unitId) setSelectedCurriculumUnit(unitId);
              if (exId) setSelectedCurriculumExercise(exId);
              setActiveView('units');
              window.location.hash = unitId ? `#${unitId}` : '#unidades';
            }}
            progress={progress}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onResetProgress={handleResetAllProgress}
            siteContent={siteContent}
            onNavigateAdmin={canAdmin ? handleNavigateAdmin : undefined}
            topics={displayedTopics}
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
        {activeView === 'topic' && !isCurriculumLoading && dynamicTopic && (
          <TopicViewer
            key={dynamicTopic.id}
            topic={dynamicTopic}
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

        {activeView === 'topic' && (isCurriculumLoading || !dynamicTopic) && (
          <p role="status" className="text-sm text-[#59645C]">{isCurriculumLoading ? 'Cargando contenido…' : 'Esta lección no está disponible. Elige otra desde el temario.'}</p>
        )}

        {/* VIEW 4: Laboratorio de Objetos (Pelota & Burbuja) */}
        {activeView === 'oop-lab' && (
          <OopLabView
            onBackToHome={() => setActiveView('home')}
            onOpenCatalogue={() => setIsCatalogueOpen(true)}
          />
        )}

        {/* VIEW 5: Exploraciones con Processing (Secuencia Piloto de 3 Ejercicios) */}
        {activeView === 'pilot' && (
          <PilotExercisesView
            onBackToHome={() => setActiveView('home')}
            currentUser={currentUser}
            configs={{
              coordinates: {
                id: 'coordinates',
                title: siteContent?.pilotEx1Title || 'Sistemas de coordenadas',
                subtitle: 'Del espacio a la forma',
                objective:
                  siteContent?.pilotEx1Objective ||
                  'Comprender el sistema cartesiano de Processing Java y utilizar coordenadas precisas (X, Y) para posicionar elementos gráficos.',
                instructions:
                  'Explora la retícula cartesiana, predice posiciones, completa el código y valida las 3 metas.',
                order: 0,
                visible: true,
                status: 'published',
              },
              conditionals: {
                id: 'conditionals',
                title: siteContent?.pilotEx2Title || 'Estructuras condicionales',
                subtitle: 'Decisiones visuales',
                objective:
                  siteContent?.pilotEx2Objective ||
                  'Comprender estructuras if, else if y else en Processing Java mediante tres zonas visuales y análisis de valores límite.',
                instructions:
                  'Observa las tres zonas, anticipa el valor límite en X=200, escribe las bifurcaciones y ejecuta las 6 pruebas de frontera.',
                order: 1,
                visible: true,
                status: 'published',
              },
              audiovisual: {
                id: 'audiovisual',
                title: siteContent?.pilotEx3Title || 'Discretización audiovisual: Video a ASCII',
                subtitle: 'Instalación Interactiva Completa',
                objective: 'Cuantización tipográfica de video en tiempo real.',
                instructions:
                  'Arrastra la división central <> para comparar original contra cuantización tipográfica.',
                order: 2,
                visible: true,
                status: 'published',
              },
            }}
          />
        )}
        {/* VIEW 6: Unidades y Actividades Curriculares (Unidad 1, 2 y 3) */}
        {activeView === 'units' && (
          <UnitActivitiesView
            onBackToHome={() => setActiveView('home')}
            currentUser={currentUser}
            initialUnitId={selectedCurriculumUnit}
            initialExerciseId={selectedCurriculumExercise}
            isStudentPreviewMode={isStudentPreviewMode}
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
        topics={displayedTopics}
        onNavigateUnits={() => {
          setSelectedCurriculumExercise(undefined);
          setActiveView('units');
          window.location.hash = '#unidades';
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Friendly and clean footer */}
      <footer className="border-t border-[#E1E7E1] py-8 text-xs text-[#59645C] bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#232A24]">Código Creativo</span>
            <span className="text-[#E1E7E1]">/</span>
            <span className="font-mono text-[11px] text-[#59645C]">Processing Java 4.3</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#59645C]">
            <button
              onClick={() => setActiveView('home')}
              className="text-[#59645C] hover:text-[#407B5D] cursor-pointer transition-colors"
            >
              Inicio
            </button>
            <span className="text-[#E1E7E1]">·</span>
            <button
              onClick={() => {
                setSelectedCurriculumExercise(undefined);
                setActiveView('units');
                window.location.hash = '#unidades';
              }}
              className="text-[#59645C] hover:text-[#407B5D] cursor-pointer transition-colors font-semibold"
            >
              Unidades 1-3
            </button>
            <span className="text-[#E1E7E1]">·</span>
            <button
              onClick={() => setIsCatalogueOpen(true)}
              className="text-[#59645C] hover:text-[#407B5D] cursor-pointer transition-colors"
            >
              Temario ({displayedTopics.length})
            </button>
            <span className="text-[#E1E7E1]">·</span>
            <button
              onClick={() => setActiveView('oop-lab')}
              className="text-[#59645C] hover:text-[#407B5D] cursor-pointer transition-colors"
            >
              Laboratorio POO
            </button>
            <span className="text-[#E1E7E1]">·</span>
            <button
              onClick={() => setActiveView('pilot')}
              className="text-[#59645C] hover:text-[#407B5D] cursor-pointer transition-colors"
            >
              Exploraciones
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
