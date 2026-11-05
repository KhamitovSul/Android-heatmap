import { describe, expect, it } from 'vitest';
import { todayKeyIn } from './today';

describe('todayKeyIn', () => {
  // 26 сентября 2026, 21:30 UTC — в Алматы (UTC+5) уже 27-е
  const late = new Date(Date.UTC(2026, 8, 26, 21, 30));

  it('считает дату в заданном поясе', () => {
    expect(todayKeyIn('UTC', late)).toBe('2026-09-26');
    expect(todayKeyIn('Asia/Almaty', late)).toBe('2026-09-27');
    expect(todayKeyIn('America/New_York', late)).toBe('2026-09-26');
  });

  it('формат YYYY-MM-DD с ведущими нулями', () => {
    expect(todayKeyIn('UTC', new Date(Date.UTC(2026, 0, 5, 12)))).toBe('2026-01-05');
  });
});
