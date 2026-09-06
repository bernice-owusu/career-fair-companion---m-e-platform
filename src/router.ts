import { useCallback, useEffect, useState } from 'react';

export type ParticipantFlowScreen =
  | 'welcome'
  | 'register'
  | 'registered_success'
  | 'checkin'
  | 'walk_in'
  | 'walk_in_success'
  | 'main';

export const SCREEN_PATHS: Record<ParticipantFlowScreen, string> = {
  welcome: '/welcome',
  register: '/preregister',
  registered_success: '/registered',
  checkin: '/checkin',
  walk_in: '/walk-in',
  walk_in_success: '/walk-in-success',
  main: '/participant',
};

export const ROUTE_SCREENS: Array<{ path: string; screen: ParticipantFlowScreen }> = [
  { path: '/', screen: 'welcome' },
  { path: '/welcome', screen: 'welcome' },
  { path: '/preregister', screen: 'register' },
  { path: '/registered', screen: 'registered_success' },
  { path: '/checkin', screen: 'checkin' },
  { path: '/walk-in', screen: 'walk_in' },
  { path: '/walk-in-success', screen: 'walk_in_success' },
  { path: '/participant', screen: 'main' },
];

export const ADMIN_PATH = '/admin';

export function screenFromPath(path: string): ParticipantFlowScreen | null {
  const match = ROUTE_SCREENS.find(r => r.path === path);
  return match ? match.screen : null;
}

// Tiny dependency-free history router so every flow screen has a real URL
// e.g. /preregister, /walk-in, /checkin. Works with the dev server and any
// host that applies an SPA fallback (history mode).
export function usePathname() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setPathname(path);
  }, []);

  return { pathname, navigate };
}