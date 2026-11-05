import {
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameMonth,
  isSameYear,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ViewMode } from '../types';

const WEEK = { weekStartsOn: 1 } as const; // неделя с понедельника

export interface Period {
  start: Date;
  end: Date;
}

export interface Cell {
  key: string;
  date: Date;
  /** Ячейка внутри просматриваемого периода (а не «добивка» до полной недели) */
  inPeriod: boolean;
}

/** Дата → '2026-09-17'. Храним календарный день, а не момент времени. */
export const toKey = (d: Date) => format(d, 'yyyy-MM-dd');
/** '2026-09-17' → локальная полночь этого дня */
export const fromKey = (key: string) => parseISO(key);

export function periodOf(mode: ViewMode, anchor: Date): Period {
  switch (mode) {
    case 'week':
      return { start: startOfWeek(anchor, WEEK), end: endOfWeek(anchor, WEEK) };
    case 'month':
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
    case 'year':
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
  }
}

export function shiftAnchor(mode: ViewMode, anchor: Date, step: number): Date {
  switch (mode) {
    case 'week':
      return addWeeks(anchor, step);
    case 'month':
      return addMonths(anchor, step);
    case 'year':
      return addYears(anchor, step);
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function periodTitle(mode: ViewMode, { start, end }: Period): string {
  switch (mode) {
    case 'year':
      return format(start, 'yyyy');
    case 'month':
      return capitalize(format(start, 'LLLL yyyy', { locale: ru }));
    case 'week':
      if (isSameMonth(start, end))
        return `${format(start, 'd')}–${format(end, 'd MMMM yyyy', { locale: ru })}`;
      if (isSameYear(start, end))
        return `${format(start, 'd MMM', { locale: ru })} – ${format(end, 'd MMM yyyy', { locale: ru })}`;
      return `${format(start, 'd MMM yyyy', { locale: ru })} – ${format(end, 'd MMM yyyy', { locale: ru })}`;
  }
}

/** Фраза для заголовков: «за 2026 год», «за сентябрь 2026», «за неделю 21–27 сентября» */
export function periodPhrase(mode: ViewMode, period: Period): string {
  switch (mode) {
    case 'year':
      return `за ${format(period.start, 'yyyy')} год`;
    case 'month':
      return `за ${format(period.start, 'LLLL yyyy', { locale: ru })}`;
    case 'week':
      return `за неделю ${periodTitle('week', period)}`;
  }
}

function cellsBetween(from: Date, to: Date, period: Period): Cell[] {
  return eachDayOfInterval({ start: from, end: to }).map((date) => ({
    key: toKey(date),
    date,
    inPeriod: date >= period.start && date <= period.end,
  }));
}

/** Период, разбитый на недели по 7 дней (пн–вс). Для года — столбцы, для месяца — строки. */
export function weeksOf(period: Period): Cell[][] {
  const cells = cellsBetween(startOfWeek(period.start, WEEK), endOfWeek(period.end, WEEK), period);
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Подписи месяцев над годовой сеткой: номер столбца-недели, где начинается месяц */
export function monthLabels(weeks: Cell[][]): { column: number; label: string }[] {
  const labels: { column: number; label: string }[] = [];
  weeks.forEach((week, column) => {
    const first = week.find((c) => c.inPeriod && c.date.getDate() === 1);
    if (first) labels.push({ column, label: MONTHS_SHORT[first.date.getMonth()] });
  });
  return labels;
}

export function daysOf(period: Period): Date[] {
  return eachDayOfInterval(period);
}

/** «Сб, 17 сентября 2026» */
export const longDate = (d: Date) => capitalize(format(d, 'EEEEEE, d MMMM yyyy', { locale: ru }));
