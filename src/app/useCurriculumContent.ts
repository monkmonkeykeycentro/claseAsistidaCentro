import { useEffect, useState } from 'react';
import { TOPICS_DATA } from '../data/topicsData';
import { getAllTopicsFromCmsOrFallback } from '../services/cmsService';
import { LearningLesson, normalizeTopic } from '../types/learning';

export function useCurriculumContent(canAdmin: boolean, includeDrafts: boolean, activeView: string) {
  const [topics, setTopics] = useState<LearningLesson[]>(TOPICS_DATA.map(normalizeTopic));
  const [includesDrafts, setIncludesDrafts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAllTopicsFromCmsOrFallback(canAdmin && includeDrafts)
      .then((loadedTopics) => {
        if (!mounted) return;
        setTopics(loadedTopics.map(normalizeTopic));
        setIncludesDrafts(canAdmin && includeDrafts);
      })
      .catch((error) => {
        console.warn('No se pudo cargar el currículo del CMS:', error);
        if (mounted) setTopics([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [activeView, canAdmin, includeDrafts]);

  return { topics, includesDrafts, isLoading };
}
