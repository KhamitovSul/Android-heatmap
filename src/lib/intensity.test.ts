import { describe, expect, it } from 'vitest';
import { levelFor, rangeLabel, shadesFor, validateThresholds } from './intensity';

describe('levelFor', () => {
  const tasks = [1, 3, 6, 11];
  it('пусто, если записи нет или значение 0', () => {
    expect(levelFor(undefined, tasks)).toBe(0);
    expect(levelFor(0, tasks)).toBe(0);
  });
  it('нижняя граница входит в уровень', () => {
    expect(levelFor(1, tasks)).toBe(1);
    expect(levelFor(2, tasks)).toBe(1);
    expect(levelFor(3, tasks)).toBe(2);
    expect(levelFor(10, tasks)).toBe(3);
    expect(levelFor(11, tasks)).toBe(4);
    expect(levelFor(500, tasks)).toBe(4);
  });
  it('значение ниже первой границы — пусто (шаги < 2000)', () => {
    expect(levelFor(1500, [2000, 5000, 8000, 12000])).toBe(0);
    expect(levelFor(9300, [2000, 5000, 8000, 12000])).toBe(3);
  });
});

describe('rangeLabel', () => {
  it('целые числа', () => {
    const t = [1, 3, 6, 11];
    expect(rangeLabel(t, 0)).toBe('меньше 1');
    expect(rangeLabel(t, 1)).toBe('1–2');
    expect(rangeLabel(t, 3)).toBe('6–10');
    expect(rangeLabel(t, 4)).toBe('11 и больше');
    expect(rangeLabel([1, 2], 1)).toBe('1');
  });
  it('дробные числа', () => {
    expect(rangeLabel([0.5, 1.5], 1)).toBe('от 0,5 до 1,5');
  });
});

describe('validateThresholds', () => {
  it('принимает возрастающие положительные границы', () => {
    expect(validateThresholds([1, 3, 6])).toBe('');
  });
  it('отклоняет неверные шкалы', () => {
    expect(validateThresholds([])).not.toBe('');
    expect(validateThresholds([0, 2])).not.toBe('');
    expect(validateThresholds([3, 3])).not.toBe('');
    expect(validateThresholds([5, 2])).not.toBe('');
  });
});

describe('shadesFor', () => {
  const activity = { id: 'a', name: 'A', unit: 'u', color: '#2a78d6', thresholds: [1, 2, 3, 4], shades: null };
  it('возвращает пустой цвет + оттенок на каждый уровень, последний — базовый', () => {
    const s = shadesFor(activity, 'light');
    expect(s).toHaveLength(5);
    expect(s[4]).toBe('#2a78d6');
  });
  it('свои цвета важнее автоматических', () => {
    const s = shadesFor({ ...activity, shades: ['#111111', '#222222', '#333333', '#444444'] }, 'dark');
    expect(s.slice(1)).toEqual(['#111111', '#222222', '#333333', '#444444']);
  });
});
