import { useEffect, useState } from 'react';
import type { Theme } from '../types';

type ThemePref = 'system' | Theme;
const KEY = 'activity-heatmap:theme';
const query = '(prefers-color-scheme: dark)';

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/** Тема: по умолчанию как в системе, кнопкой можно закрепить светлую или тёмную */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref);
  const [systemDark, setSystemDark] = useState(() => matchMedia(query).matches);

  useEffect(() => {
    const mq = matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (pref === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', pref);
    try {
      if (pref === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, pref);
    } catch {
      /* хранилище недоступно — тема просто не запомнится */
    }
  }, [pref]);

  const theme: Theme = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;
  const toggle = () => setPref(theme === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}
