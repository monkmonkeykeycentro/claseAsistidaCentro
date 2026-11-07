import { useEffect, useState } from 'react';
import { TOPICS_DATA } from '../data/topicsData';
import { getAllTopicsFromCmsOrFallback } from '../services/cmsService';
import { LearningLesson, normalizeTopic } from '../types/learning';

export function useCurriculumContent(canAdmin: boolean, includeDrafts: boolean, activeView: string, contentRevision = '') {
  const [topics, setTopics] = useState<LearningLesson[]>(TOPICS_DATA.map(normalizeTopic));
  const [includesDrafts, setIncludesDrafts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let latestRequest = 0;
    const refresh = () => {
      const request = ++latestRequest;
      setIsLoading(true);
      getAllTopicsFromCmsOrFallback(canAdmin && includeDrafts)
        .then((loadedTopics) => {
          if (!mounted || request !== latestRequest) return;
          setTopics(loadedTopics.map(normalizeTopic));
          setIncludesDrafts(canAdmin && includeDrafts);
        })
        .catch((error) => {
          console.warn('No se pudo cargar el currículo del CMS:', error);
          if (mounted && request === latestRequest) setTopics([]);
        })
        .finally(() => {
          if (mounted && request === latestRequest) setIsLoading(false);
        });
    };
    refresh();
    // Returning from the CMS in another tab must refresh an already open home.
    if (activeView === 'home') window.addEventListener('focus', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('focus', refresh);
    };
  }, [activeView, canAdmin, includeDrafts, contentRevision]);

  return { topics, includesDrafts, isLoading };
}
