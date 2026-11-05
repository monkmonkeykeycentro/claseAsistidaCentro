/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BuilderState, ZoneId } from './types/classStructure';
import { TOPICS_DATA } from './data/topicsData';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FocusedWorkshopView } from './components/FocusedWorkshopView';
import { TopicsCatalogueModal } from './components/TopicsCatalogueModal';
import { TopicViewer } from './components/TopicViewer';
import { AuthModal } from './components/AuthModal';
import { OopLabView } from './components/oopLab/OopLabView';
import { PilotExercisesView } from './components/pilot/PilotExercisesView';
import { UnitActivitiesView } from './components/curriculum/UnitActivitiesView';
import { ClassDesignerRoot } from './components/classDesigner/ClassDesignerRoot';
import { VideoAsciiSplitCanvas } from './components/generative/VideoAsciiSplitCanvas';
import {
  AppUser,
  subscribeToAuth,
  isUserAdmin,
} from './services/firebase';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { subscribeToSiteContent } from './services/cmsService';
import { CmsSiteContentCombined } from './types/cms';
import { BookOpen, Eye, X, Settings } from 'lucide-react';
import { navigateToRoute } from './app/routeState';
import { useAppNavigation } from './app/useAppNavigation';
import { useCurriculumContent } from './app/useCurriculumContent';
import { useLearningProgress } from './app/useLearningProgress';
import { LearningLesson, normalizeTopic } from './types/learning';

export default function App() {
  const [siteContent, setSiteContent] = useState<CmsSiteContentCombined | null>(null);
  const [isStudentPreviewMode, setIsStudentPreviewMode] = useState<boolean>(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const canAdmin = isUserAdmin(currentUser);
  const navigation = useAppNavigation(canAdmin);
  const {
    activeView,
    setActiveView,
    currentTopicId,
    setCurrentTopicId,
    selectedCurriculumUnit,
    setSelectedCurriculumUnit,
    selectedCurriculumExercise,
    setSelectedCurriculumExercise,
    navigate,
    navigateHome,
    navigateTopic,
    navigateUnits,
  } = navigation;
  const learning = useLearningProgress(currentUser, currentTopicId);
  const {
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
  } = learning;
  const curriculum = useCurriculumContent(canAdmin, isStudentPreviewMode, activeView);
  const { topics: allCurriculumTopics, includesDrafts: curriculumIncludesDrafts, isLoading: isCurriculumLoading } = curriculum;
  const displayedTopics = curriculumIncludesDrafts && !canAdmin ? [] : allCurriculumTopics;
  const dynamicTopic = displayedTopics.find((topic) => topic.id === currentTopicId) || null;
  const handleNavigateAdmin = () => {
    if (!canAdmin) return;
    setActiveView('admin');
    navigate({ view: 'admin' });
  };

  const handleExitAdmin = () => {
    navigateHome();
  };

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


  // Keep one identity subscription; changing lessons must not reset admin access.
  useEffect(() => subscribeToAuth(setCurrentUser), []);

  const handleSelectTopicFromCatalogue = (topicId: string) => {
    setCurrentTopicId(topicId);
    if (topicId === 'classes') {
      setActiveView('workshop');
    } else {
      setActiveView('topic');
    }
    navigateToRoute({ view: topicId === 'classes' ? 'workshop' : 'topic', topicId });
  };

  const currentTopic: LearningLesson = normalizeTopic(
    TOPICS_DATA.find((t) => t.id === currentTopicId) || TOPICS_DATA[5],
  );
  const handleSectionVisited = useCallback((sectionId: string, totalSections: number) => {
    markLessonSectionVisited(currentTopicId, sectionId, totalSections);
  }, [currentTopicId, markLessonSectionVisited]);
  const currentTopicIndex = displayedTopics.findIndex((topic) => topic.id === currentTopicId);
  const previousTopicId = currentTopicIndex > 0 ? displayedTopics[currentTopicIndex - 1]?.id : undefined;
  const nextTopicId = currentTopicIndex >= 0 ? displayedTopics[currentTopicIndex + 1]?.id : undefined;
  const resumeTopicId = [...displayedTopics]
    .filter((topic) => progress.lessonProgress?.[topic.id])
    .sort((a, b) => new Date(progress.lessonProgress?.[b.id]?.lastVisitedAt || 0).getTime() - new Date(progress.lessonProgress?.[a.id]?.lastVisitedAt || 0).getTime())[0]?.id;

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
        onNavigateHome={() => {
          setActiveView('home');
          if (window.location.hash.includes('caballo') || window.location.hash.includes('horse')) {
            try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch { window.location.hash = ''; }
          }
        }}
        onOpenCatalogue={() => setIsCatalogueOpen(true)}
        onNavigateOopLab={() => setActiveView('oop-lab')}
        onNavigatePilot={() => setActiveView('pilot')}
        onNavigateHorse={() => {
          setActiveView('horse');
          window.location.hash = '#caballo';
        }}
        onNavigateUnits={() => {
          setSelectedCurriculumExercise(undefined);
          setActiveView('units');
          window.location.hash = '#unidades';
        }}
        onNavigateClassDesigner={() => {
          setActiveView('class-designer');
          window.location.hash = '#disenador-clases';
        }}
        onNavigateAdmin={canAdmin ? handleNavigateAdmin : undefined}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isSyncing={isSyncing}
        topicCount={displayedTopics.length}
        navigationItems={siteContent?.headerNavigation}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ErrorBoundary
          fallbackTitle="Se produjo un error al cargar la vista activa"
          onReset={() => setActiveView('home')}
        >
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
              navigateToRoute({ view: 'workshop', topicId: 'classes' });
            }}
            onSelectTopic={(tId) => {
              setCurrentTopicId(tId);
              if (tId === 'classes') {
                setActiveView('workshop');
                navigateToRoute({ view: 'workshop', topicId: tId });
              } else {
                setActiveView('topic');
                navigateToRoute({ view: 'topic', topicId: tId });
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
            onOpenClassDesigner={() => {
              setActiveView('class-designer');
              window.location.hash = '#disenador-clases';
            }}
            onNavigateHorse={() => {
              setActiveView('horse');
              window.location.hash = '#caballo';
            }}
            progress={progress}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onResetProgress={resetAllProgress}
            siteContent={siteContent}
            onNavigateAdmin={canAdmin ? handleNavigateAdmin : undefined}
            topics={displayedTopics}
            currentTopicId={currentTopicId}
            resumeTopicId={resumeTopicId}
          />
        )}

        {/* VIEW 2: Focused Workshop View */}
        {activeView === 'workshop' && (
          <FocusedWorkshopView
            currentStage={currentStage}
            onSelectStage={(st) => setCurrentStage(st)}
            progress={progress}
            onStageComplete={completeStage}
            onSaveStage2Placements={saveStage2Placements}
            onSaveStage3Exercise={saveStage3Exercise}
            savedBuilderState={savedBuilderState}
            onSaveBuilderState={saveBuilderState}
            onResetAllProgress={resetAllProgress}
            onBackToHome={() => {
              setActiveView('home');
              navigateToRoute({ view: 'home' });
            }}
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
                navigateToRoute({ view: 'workshop', topicId: tId });
              } else {
                setActiveView('topic');
                navigateToRoute({ view: 'topic', topicId: tId });
              }
            }}
            onOpenCatalogue={() => setIsCatalogueOpen(true)}
            lessonProgress={progress.lessonProgress?.[currentTopicId]}
            onSectionVisited={handleSectionVisited}
            previousTopicId={previousTopicId}
            nextTopicId={nextTopicId}
            onBackToHome={() => {
              setActiveView('home');
              navigateToRoute({ view: 'home' });
            }}
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
            activityProgress={progress.activityProgress}
            onActivityResult={saveActivityResult}
          />
        )}

        {/* VIEW 7: Diseñador de Clases (POO) */}
        {activeView === 'class-designer' && (
          <ClassDesignerRoot
            onBackToHome={() => {
              setActiveView('home');
              if (
                window.location.hash === '#disenador-clases' ||
                window.location.hash === '#disenador' ||
                window.location.hash === '#class-designer' ||
                window.location.hash === '#herramientas'
              ) {
                try {
                  window.history.replaceState(null, '', window.location.pathname + window.location.search);
                } catch {
                  window.location.hash = '';
                }
              }
            }}
            currentUser={currentUser}
            onOpenCatalogue={() => setIsCatalogueOpen(true)}
          />
        )}
        {/* VIEW 8: Ejemplo Fundamental: El Caballo al Galope (Muybridge 1878) */}
        {activeView === 'horse' && (
          <section className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7E1] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveView('home');
                      window.location.hash = '';
                    }}
                    className="text-xs font-bold text-[#407B5D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Inicio</span>
                  </button>
                  <span className="text-[#8E8E89]">/</span>
                  <span className="text-[11px] font-mono font-bold uppercase bg-[#E8EEE8] text-[#407B5D] px-2.5 py-0.5 rounded">
                    Ejemplo Fundamental · 1878
                  </span>
                  <span className="text-[11px] font-mono text-[#8A6318] bg-[#FDF5E6] px-2 py-0.5 rounded">
                    Sallie Gardner at a Gallop
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#232A24] tracking-tight">
                  El Caballo al Galope: Discretización de Video a ASCII
                </h1>
                <p className="text-xs sm:text-sm text-[#59645C] max-w-3xl leading-relaxed">
                  Instalación interactiva basada en el histórico estudio de movimiento de Eadweard Muybridge. Arrastra la barra divisoria <code className="bg-[#E8EEE8] px-1.5 py-0.5 rounded font-mono font-bold text-[#232A24]">&lt;&gt;</code> para comparar el metraje original contra la cuantización tipográfica en Processing Java.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveView('pilot');
                    window.location.hash = '#piloto';
                  }}
                  className="px-3.5 py-2 border border-[#E1E7E1] hover:bg-[#E8EEE8] text-xs font-semibold rounded-xl text-[#232A24] transition-all cursor-pointer"
                >
                  Ver módulo piloto completo
                </button>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.location.hash = '';
                  }}
                  className="px-4 py-2 bg-[#407B5D] hover:bg-[#33654C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Volver al inicio
                </button>
              </div>
            </div>

            <VideoAsciiSplitCanvas defaultVideoSrc="/video.mp4" />
          </section>
        )}
        </ErrorBoundary>
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
                setActiveView('class-designer');
                window.location.hash = '#disenador-clases';
              }}
              className="text-[#59645C] hover:text-[#407B5D] cursor-pointer transition-colors font-semibold"
            >
              Diseñador de Clases
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
