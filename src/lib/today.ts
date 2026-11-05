import { useEffect, useState } from 'react';
import { fromKey } from './dates';

/**
 * Пояса, которые подставляют браузеры с защитой от фингерпринтинга
 * (LibreWolf, Firefox с resistFingerprinting, Tor Browser) вместо настоящего.
 */
const SPOOFED_ZONES = new Set(['UTC', 'Etc/UTC', 'Etc/GMT', 'GMT', 'Atlantic/Reykjavik']);

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Браузер, скорее всего, скрывает настоящий часовой пояс */
export const timeZoneLooksSpoofed = () => SPOOFED_ZONES.has(browserTimeZone());

/** Браузер на движке Gecko: Firefox, LibreWolf, Waterfox, Floorp… */
export const isGecko = () => /\bGecko\/\d/.test(navigator.userAgent) && /Firefox\//.test(navigator.userAgent);

export function allTimeZones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC'];
  }
}

/**
 * Сегодняшняя дата 'YYYY-MM-DD' в указанном поясе.
 * null — по часам браузера. Явный timeZone работает даже при подмене пояса браузером.
 */
export function todayKeyIn(timeZone: string | null, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone ?? undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Текущий день; сам обновляется после полуночи, если вкладка открыта */
export function useToday(timeZone: string | null): { today: Date; todayKey: string } {
  const [todayKey, setTodayKey] = useState(() => todayKeyIn(timeZone));
  useEffect(() => {
    setTodayKey(todayKeyIn(timeZone));
    const id = setInterval(() => setTodayKey(todayKeyIn(timeZone)), 60_000);
    return () => clearInterval(id);
  }, [timeZone]);
  const [today, setToday] = useState(() => fromKey(todayKey));
  useEffect(() => setToday(fromKey(todayKey)), [todayKey]);
  return { today, todayKey };
}
