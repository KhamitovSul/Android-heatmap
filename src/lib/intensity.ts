import type { Activity, Theme } from '../types';
import { mix } from './color';

export const MAX_LEVELS = 6;

/** Цвет пустой ячейки — должен совпадать с --cell-empty в tokens.css */
export const EMPTY_CELL: Record<Theme, string> = {
  light: '#e3e8ef',
  dark: '#232c38',
};

/** Палитра для новых активностей (проверена на различимость при дальтонизме) */
export const PRESET_COLORS = [
  '#2a78d6', // синий
  '#eb6834', // оранжевый
  '#1baf7a', // бирюзовый
  '#eda100', // жёлтый
  '#e87ba4', // розовый
  '#008300', // зелёный
  '#4a3aa7', // фиолетовый
  '#e34948', // красный
];

/** Значение → уровень 0..thresholds.length */
export function levelFor(value: number | undefined, thresholds: number[]): number {
  if (value === undefined || value <= 0) return 0;
  let level = 0;
  for (const t of thresholds) if (value >= t) level++;
  return level;
}

/** Доля базового цвета в автоматическом оттенке уровня (1..levels) */
function autoShare(level: number, levels: number): number {
  if (levels <= 1) return 1;
  return 0.3 + (0.7 * (level - 1)) / (levels - 1);
}

export function autoShades(color: string, levels: number, theme: Theme): string[] {
  return Array.from({ length: levels }, (_, i) =>
    mix(color, EMPTY_CELL[theme], autoShare(i + 1, levels)),
  );
}

/**
 * Цвета всех уровней: [0] — пустая ячейка, [1..n] — оттенки.
 * Свои цвета пользователя важнее автоматических.
 */
export function shadesFor(activity: Activity, theme: Theme): string[] {
  const levels = activity.thresholds.length;
  const auto = autoShades(activity.color, levels, theme);
  const custom = activity.shades;
  return [EMPTY_CELL[theme], ...auto.map((c, i) => custom?.[i] ?? c)];
}

const isInt = (n: number) => Number.isInteger(n);

/** Подпись диапазона уровня: «3–5», «11 и больше», «меньше 2 000» */
export function rangeLabel(thresholds: number[], level: number): string {
  const f = formatNumber;
  if (level === 0) return thresholds.length ? `меньше ${f(thresholds[0])}` : 'нет';
  const from = thresholds[level - 1];
  const to = thresholds[level];
  if (to === undefined) return `${f(from)} и больше`;
  if (isInt(from) && isInt(to)) return to - 1 === from ? f(from) : `${f(from)}–${f(to - 1)}`;
  return `от ${f(from)} до ${f(to)}`;
}

/** Проверка шкалы: пустая строка = всё хорошо */
export function validateThresholds(thresholds: number[]): string {
  if (thresholds.length === 0) return 'Нужен хотя бы один уровень.';
  if (thresholds.some((t) => !Number.isFinite(t) || t <= 0))
    return 'Границы уровней должны быть больше нуля.';
  for (let i = 1; i < thresholds.length; i++)
    if (thresholds[i] <= thresholds[i - 1])
      return 'Каждая следующая граница должна быть больше предыдущей.';
  return '';
}

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export const formatNumber = (n: number) => nf.format(n);
