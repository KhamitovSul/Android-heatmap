import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { Activity, Entries } from '../types';
import { fromKey, toKey, type Period } from './dates';

export interface ActivityStats {
  /** Дней с записью > 0 в периоде */
  activeDays: number;
  /** Прошедших дней периода (будущие не считаем) */
  elapsedDays: number;
  /** activeDays / elapsedDays, 0..1 */
  rate: number;
  total: number;
  best: number;
  /** Дней подряд с активностью, заканчивая сегодня (или вчера, если сегодня ещё пусто) */
  currentStreak: number;
  longestStreak: number;
}

/** Последний учитываемый день периода: конец периода или сегодня, что раньше */
function lastCountedDay(period: Period, today: Date): Date | null {
  const t = startOfDay(today);
  if (period.start > t) return null;
  return period.end < t ? startOfDay(period.end) : t;
}

export function elapsedDays(period: Period, today: Date): number {
  const last = lastCountedDay(period, today);
  return last ? differenceInCalendarDays(last, period.start) + 1 : 0;
}

function forEachElapsedDay(period: Period, today: Date, fn: (key: string) => void) {
  const n = elapsedDays(period, today);
  for (let i = 0; i < n; i++) fn(toKey(addDays(period.start, i)));
}

export function currentStreak(values: Record<string, number>, today: Date): number {
  let day = startOfDay(today);
  if (!(values[toKey(day)] > 0)) day = addDays(day, -1);
  let streak = 0;
  while (values[toKey(day)] > 0) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function longestStreak(values: Record<string, number>): number {
  const days = Object.keys(values)
    .filter((k) => values[k] > 0)
    .sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of days) {
    const d = fromKey(key);
    run = prev && differenceInCalendarDays(d, prev) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function statsFor(
  values: Record<string, number> = {},
  period: Period,
  today: Date,
): ActivityStats {
  let activeDays = 0;
  let total = 0;
  let best = 0;
  forEachElapsedDay(period, today, (key) => {
    const v = values[key];
    if (v > 0) {
      activeDays++;
      total += v;
      best = Math.max(best, v);
    }
  });
  const elapsed = elapsedDays(period, today);
  return {
    activeDays,
    elapsedDays: elapsed,
    rate: elapsed ? activeDays / elapsed : 0,
    total,
    best,
    currentStreak: currentStreak(values, today),
    longestStreak: longestStreak(values),
  };
}

/** Сколько дней периода была хоть одна активность */
export function overallActiveDays(
  activities: Activity[],
  entries: Entries,
  period: Period,
  today: Date,
): { activeDays: number; elapsedDays: number; rate: number } {
  let activeDays = 0;
  forEachElapsedDay(period, today, (key) => {
    if (activities.some((a) => entries[a.id]?.[key] > 0)) activeDays++;
  });
  const elapsed = elapsedDays(period, today);
  return { activeDays, elapsedDays: elapsed, rate: elapsed ? activeDays / elapsed : 0 };
}
