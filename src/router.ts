import { useCallback, useEffect, useState } from 'react';

export type ParticipantFlowScreen =
  | 'welcome'
  | 'register'
  | 'checkin'
  | 'walk_in'
  | 'monday_register'
  | 'main';

// The participant platform can be opened directly at a specific panel.
export type PlatformTarget = 'home' | 'questions' | 'survey' | 'ticket';

export const SCREEN_PATHS: Record<ParticipantFlowScreen, string> = {
  welcome: '/welcome',
  register: '/pre-register',
  checkin: '/checkin',
  walk_in: '/walk-in',
  monday_register: '/monday',
  main: '/participant',
};

export const PLATFORM_TARGET_PATHS: Record<Exclude<PlatformTarget, 'home'>, string> = {
  questions: '/questions',
  survey: '/survey',
  ticket: '/ticket',
};

export const ROUTE_SCREENS: Array<{ path: string; screen: ParticipantFlowScreen }> = [
  { path: '/', screen: 'welcome' },
  { path: '/welcome', screen: 'welcome' },
  { path: '/pre-register', screen: 'register' },
  { path: '/preregister', screen: 'register' }, // legacy alias
  { path: '/registered', screen: 'welcome' }, // legacy confirmation redirect
  { path: '/checkin', screen: 'checkin' },
  { path: '/walk-in', screen: 'walk_in' },
  { path: '/walk-in-success', screen: 'welcome' }, // legacy success redirect
  { path: '/monday', screen: 'monday_register' },
  { path: '/participant', screen: 'main' },
  { path: '/platform', screen: 'main' },
  { path: '/questions', screen: 'main' },
  { path: '/survey', screen: 'main' },
  { path: '/ticket', screen: 'main' },
];

export const MNE_ADMIN_PATH = '/mneadmin';
// Legacy admin path — still accepted for bookmarks/links
export const ADMIN_PATH = '/admin';

export function isAdminPath(path: string): boolean {
  return path === MNE_ADMIN_PATH || path === ADMIN_PATH;
}

export function screenFromPath(path: string): ParticipantFlowScreen | null {
  const match = ROUTE_SCREENS.find(r => r.path === path);
  return match ? match.screen : null;
}

// Which panel of the platform should open for the current URL path, if any.
export function platformTargetFromPath(path: string): PlatformTarget {
  switch (path) {
    case '/questions':
      return 'questions';
    case '/ticket':
      return 'ticket';
    case '/survey':
      return 'survey';
    default:
      return 'home';
  }
}

// Tiny dependency-free history router so every flow screen has a real URL
// e.g. /pre-register, /walk-in, /checkin. Works with the dev server and any
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