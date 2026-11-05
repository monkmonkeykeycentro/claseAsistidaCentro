import type { ViewMode } from '../types/navigation';

export interface AppRoute {
  view: ViewMode;
  topicId?: string;
  unitId?: 'u1' | 'u2' | 'u3';
  exerciseId?: string;
}

const validTopicId = (value: string | undefined): string | undefined =>
  value && /^[a-zA-Z0-9_-]+$/.test(value) ? value : undefined;

export function parseAppRoute(location: Location): AppRoute {
  const rawHash = location.hash.replace(/^#/, '').replace(/^\/+/, '');
  const segments = rawHash.split('/').filter(Boolean).map(decodeURIComponent);
  const legacyHash = `#${rawHash.toLowerCase()}`;
  const search = new URLSearchParams(location.search.toLowerCase());

  if (segments[0] === 'lecciones' && validTopicId(segments[1])) {
    const topicId = validTopicId(segments[1]);
    return { view: topicId === 'classes' ? 'workshop' : 'topic', topicId };
  }
  if (segments[0] === 'unidades') {
    const unitId = segments[1] && /^u[123]$/.test(segments[1]) ? segments[1] as AppRoute['unitId'] : 'u1';
    return { view: 'units', unitId, exerciseId: segments[2] };
  }
  if (legacyHash === '#admin' || legacyHash === '#cms' || search.has('admin') || search.has('cms')) return { view: 'admin' };
  if (legacyHash === '#unidades' || legacyHash === '#actividades' || search.has('units') || search.has('unidades')) {
    const unitId = /^#u[123]$/.test(legacyHash) ? legacyHash.slice(1) as AppRoute['unitId'] : 'u1';
    return { view: 'units', unitId };
  }
  if (['#u1', '#u2', '#u3'].includes(legacyHash)) return { view: 'units', unitId: legacyHash.slice(1) as AppRoute['unitId'] };
  if (['#exploraciones', '#piloto', '#coordenadas', '#condicionales', '#audiovisual'].includes(legacyHash) || search.has('pilot') || search.has('exploraciones')) return { view: 'pilot' };
  if (['#disenador-clases', '#disenador', '#class-designer', '#herramientas'].includes(legacyHash) || search.has('disenador') || search.has('designer')) return { view: 'class-designer' };
  if (['#caballo', '#caballo-galope', '#muybridge', '#horse', '#video-ascii'].includes(legacyHash) || search.has('horse') || search.has('caballo')) return { view: 'horse' };
  return { view: 'home' };
}

export function routeHash(route: AppRoute): string {
  if (route.view === 'topic' || route.view === 'workshop') return `#/lecciones/${encodeURIComponent(route.topicId || 'classes')}`;
  if (route.view === 'units') return route.exerciseId
    ? `#/unidades/${route.unitId || 'u1'}/${encodeURIComponent(route.exerciseId)}`
    : `#/unidades/${route.unitId || 'u1'}`;
  if (route.view === 'admin') return '#/admin';
  if (route.view === 'pilot') return '#/exploraciones';
  if (route.view === 'class-designer') return '#/herramientas';
  if (route.view === 'horse') return '#/caballo';
  return '#/';
}

export function navigateToRoute(route: AppRoute, replace = false): void {
  const hash = routeHash(route);
  const url = `${window.location.pathname}${window.location.search}${hash}`;
  if (replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
