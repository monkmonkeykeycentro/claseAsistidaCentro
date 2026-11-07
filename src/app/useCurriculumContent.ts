import { useCallback, useEffect, useRef, useState } from 'react';
import { getAllTopicsFromCmsOrFallback } from '../services/cmsService';
import { LearningLesson, normalizeTopic } from '../types/learning';
import { logSafeError } from '../utils/safeError';

export function useCurriculumContent(canAdmin: boolean, includeDrafts: boolean, activeView: string, contentRevision = '') {
  const preview = canAdmin && includeDrafts;
  const [result, setResult] = useState<{ topics: LearningLesson[]; includesDrafts: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const previousView = useRef(activeView);

  // Opening a lesson uses the loaded catalogue. Returning from editing is the
  // navigation transition that invalidates it.
  useEffect(() => {
    if (previousView.current === 'admin' && activeView !== 'admin') reload();
    previousView.current = activeView;
  }, [activeView, reload]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    getAllTopicsFromCmsOrFallback(preview)
      .then((topics) => {
        if (mounted) setResult({ topics: topics.map(normalizeTopic), includesDrafts: preview });
      })
      .catch((reason) => {
        logSafeError('No se pudo cargar el currículo del CMS:', reason);
        if (mounted) setError('No se pudo actualizar el temario. Vuelve a intentarlo.');
      })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [preview, contentRevision, revision]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState !== 'hidden') reload(); };
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [reload]);

  // Never retain draft content when preview or administrator access is lost.
  const matchesAccess = result?.includesDrafts === preview;
  return { topics: matchesAccess && result ? result.topics : [], includesDrafts: preview, isLoading: !matchesAccess && !error, isRefreshing: isLoading && matchesAccess, error, reload };
}
