import { useCallback, useEffect, useState } from 'react';
import { navigateToRoute, parseAppRoute } from './routeState';
import type { AppRoute } from './routeState';
import type { ViewMode } from '../types/navigation';

type UnitId = 'u1' | 'u2' | 'u3';

export function useAppNavigation(canAdmin: boolean) {
  const initialRoute = parseAppRoute(window.location);
  const [activeView, setActiveView] = useState<ViewMode>(initialRoute.view);
  const [currentTopicId, setCurrentTopicId] = useState(() => initialRoute.topicId || readStoredTopic());
  const [selectedCurriculumUnit, setSelectedCurriculumUnit] = useState<UnitId>(initialRoute.unitId || 'u1');
  const [selectedCurriculumExercise, setSelectedCurriculumExercise] = useState<string | undefined>(initialRoute.exerciseId);

  const navigate = useCallback((route: AppRoute) => {
    setActiveView(route.view);
    if (route.topicId) setCurrentTopicId(route.topicId);
    if (route.unitId) setSelectedCurriculumUnit(route.unitId);
    setSelectedCurriculumExercise(route.exerciseId);
    navigateToRoute(route);
  }, []);

  const navigateHome = useCallback(() => navigate({ view: 'home' }), [navigate]);
  const navigateTopic = useCallback((topicId: string) => {
    navigate({ view: topicId === 'classes' ? 'workshop' : 'topic', topicId });
  }, [navigate]);
  const navigateUnits = useCallback((unitId?: UnitId, exerciseId?: string) => {
    navigate({ view: 'units', unitId: unitId || 'u1', exerciseId });
  }, [navigate]);

  useEffect(() => {
    const syncRoute = () => {
      const route = parseAppRoute(window.location);
      if (route.view === 'admin' && !canAdmin) return;
      setActiveView(route.view);
      if (route.topicId) setCurrentTopicId(route.topicId);
      if (route.unitId) setSelectedCurriculumUnit(route.unitId);
      setSelectedCurriculumExercise(route.exerciseId);
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (canAdmin && (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        navigate({ view: 'admin' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canAdmin, navigate]);

  useEffect(() => {
    try { localStorage.setItem('processing_current_topic_id', currentTopicId); } catch { /* Storage is optional. */ }
  }, [currentTopicId]);

  return {
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
  };
}

function readStoredTopic(): string {
  try {
    const saved = localStorage.getItem('processing_current_topic_id');
    return saved && /^[a-zA-Z0-9_-]+$/.test(saved) ? saved : 'classes';
  } catch {
    return 'classes';
  }
}
