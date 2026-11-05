import { describe, expect, it } from 'vitest';
import { fromKey, monthLabels, periodOf, periodTitle, toKey, weeksOf } from './dates';

describe('даты', () => {
  it('ключ дня не зависит от времени суток', () => {
    expect(toKey(new Date(2026, 8, 17, 23, 59))).toBe('2026-09-17');
    expect(toKey(fromKey('2026-09-17'))).toBe('2026-09-17');
  });

  it('неделя начинается с понедельника', () => {
    const p = periodOf('week', new Date(2026, 8, 17)); // чт
    expect(toKey(p.start)).toBe('2026-09-14');
    expect(toKey(p.end)).toBe('2026-09-20');
  });

  it('год разбивается на полные недели, лишние дни помечены', () => {
    const weeks = weeksOf(periodOf('year', new Date(2026, 5, 1)));
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0].key).toBe('2025-12-29'); // 1 января 2026 — четверг
    expect(weeks[0][0].inPeriod).toBe(false);
    expect(weeks[0][3].key).toBe('2026-01-01');
    const inYear = weeks.flat().filter((c) => c.inPeriod);
    expect(inYear).toHaveLength(365);
  });

  it('високосный год — 366 дней', () => {
    const inYear = weeksOf(periodOf('year', new Date(2028, 0, 1))).flat().filter((c) => c.inPeriod);
    expect(inYear).toHaveLength(366);
  });

  it('подписи месяцев — 12 штук по порядку', () => {
    const labels = monthLabels(weeksOf(periodOf('year', new Date(2026, 0, 1))));
    expect(labels.map((l) => l.label)).toEqual(['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']);
  });

  it('заголовки периодов', () => {
    const d = new Date(2026, 8, 17);
    expect(periodTitle('year', periodOf('year', d))).toBe('2026');
    expect(periodTitle('month', periodOf('month', d))).toBe('Сентябрь 2026');
    expect(periodTitle('week', periodOf('week', d))).toBe('14–20 сентября 2026');
  });
});
