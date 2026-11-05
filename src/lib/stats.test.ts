import { describe, expect, it } from 'vitest';
import { periodOf } from './dates';
import { currentStreak, longestStreak, statsFor } from './stats';

const today = new Date(2026, 8, 17);

describe('статистика', () => {
  const values = {
    '2026-09-01': 3,
    '2026-09-02': 5,
    '2026-09-03': 1,
    '2026-09-15': 2,
    '2026-09-16': 4,
    '2026-09-17': 7,
    '2026-08-31': 2,
  };

  it('считает только прошедшие дни периода', () => {
    const s = statsFor(values, periodOf('month', today), today);
    expect(s.elapsedDays).toBe(17);
    expect(s.activeDays).toBe(6);
    expect(s.total).toBe(22);
    expect(s.best).toBe(7);
  });

  it('текущая серия заканчивается сегодня', () => {
    expect(currentStreak(values, today)).toBe(3);
  });

  it('если сегодня ещё пусто, серия считается со вчера', () => {
    const { ['2026-09-17']: _t, ...rest } = values;
    expect(currentStreak(rest, today)).toBe(2);
  });

  it('лучшая серия переходит через границу месяца', () => {
    expect(longestStreak(values)).toBe(4); // 31 авг – 3 сен
  });

  it('будущий период — ноль дней', () => {
    const s = statsFor(values, periodOf('year', new Date(2027, 0, 1)), today);
    expect(s.elapsedDays).toBe(0);
    expect(s.rate).toBe(0);
  });
});
