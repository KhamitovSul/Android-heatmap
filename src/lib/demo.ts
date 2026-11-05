import { addDays, startOfDay } from 'date-fns';
import type { Activity, Entries } from '../types';
import { toKey } from './dates';

// Детерминированный генератор случайных чисел: пример всегда одинаковый
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoData(today = new Date()): { activities: Activity[]; entries: Entries } {
  const activities: Activity[] = [
    { id: 'demo-code', name: 'Программирование', unit: 'задачи', color: '#2a78d6', thresholds: [1, 3, 6, 11], shades: null },
    { id: 'demo-steps', name: 'Шаги', unit: 'шаги', color: '#008300', thresholds: [2000, 5000, 8000, 12000], shades: null },
    { id: 'demo-read', name: 'Чтение', unit: 'минуты', color: '#eb6834', thresholds: [10, 20, 40, 60], shades: null },
    { id: 'demo-gym', name: 'Тренировки', unit: 'тренировки', color: '#e34948', thresholds: [1, 2], shades: null },
  ];
  const rnd = mulberry32(17);
  const entries: Entries = Object.fromEntries(activities.map((a) => [a.id, {}]));
  const end = startOfDay(today);
  const DAYS = 500;

  for (let i = DAYS; i >= 0; i--) {
    const d = addDays(end, -i);
    const key = toKey(d);
    const weekday = (d.getDay() + 6) % 7; // 0 = пн
    const weekend = weekday >= 5;
    // «Сессия» — месяц интенсивной учёбы, «отпуск» — две недели без кода
    const month = d.getMonth();
    const vacation = month === 7 && d.getDate() < 15;
    const exams = month === 0 || month === 5;

    if (!vacation && rnd() < (weekend ? 0.45 : 0.82)) {
      const base = exams ? 2 : 5;
      entries['demo-code'][key] = Math.max(1, Math.round(base + rnd() * (exams ? 4 : 9)));
    }
    const steps = Math.round((weekend ? 9000 : 6500) + (rnd() - 0.5) * 9000 + (vacation ? 5000 : 0));
    if (steps > 800) entries['demo-steps'][key] = steps;
    if (rnd() < (exams ? 0.25 : 0.6)) entries['demo-read'][key] = Math.round(10 + rnd() * 70);
    if ([0, 2, 4].includes(weekday) && rnd() < 0.8) entries['demo-gym'][key] = rnd() < 0.2 ? 2 : 1;
  }
  return { activities, entries };
}
