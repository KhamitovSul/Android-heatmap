import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Activity, Entries, Theme } from '../types';
import { fromKey, longDate, toKey } from '../lib/dates';
import { levelFor, shadesFor } from '../lib/intensity';
import { addDays, format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from './icons';

interface Props {
  dateKey: string;
  todayKey: string;
  onDateChange: (key: string) => void;
  activities: Activity[];
  entries: Entries;
  theme: Theme;
  onSave: (dateKey: string, values: Record<string, number | null>) => void;
}

/** '' → null, '7' → 7, '2,5' → 2.5, мусор → NaN */
function parse(raw: string): number | null {
  const s = raw.trim().replace(',', '.').replace(/\s/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export function DayForm({ dateKey, todayKey, onDateChange, activities, entries, theme, onSave }: Props) {
  const stored = (id: string) => entries[id]?.[dateKey];
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Новая дата или новые данные — заново заполняем поля сохранёнными значениями
  useEffect(() => {
    setDraft(Object.fromEntries(activities.map((a) => [a.id, stored(a.id)?.toString() ?? ''])));
  }, [dateKey, activities, entries]);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const parsed = useMemo(
    () => Object.fromEntries(activities.map((a) => [a.id, parse(draft[a.id] ?? '')])),
    [activities, draft],
  );
  const invalid = activities.some((a) => Number.isNaN(parsed[a.id]));
  const dirty = activities.some((a) => (parsed[a.id] || null) !== (stored(a.id) ?? null));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (invalid || !dirty) return;
    onSave(dateKey, parsed);
    setSavedAt(dateKey);
  };

  const date = fromKey(dateKey);
  const yesterday = toKey(addDays(fromKey(todayKey), -1));
  const heading = dateKey === todayKey ? 'Сегодня' : dateKey === yesterday ? 'Вчера' : longDate(date);

  return (
    <section className="day" id="day-form" aria-labelledby="day-title">
      <h2 id="day-title">Итоги дня</h2>

      <div className="day__date">
        <button type="button" className="icon-btn" onClick={() => onDateChange(toKey(addDays(date, -1)))} aria-label="Предыдущий день">
          <ChevronLeft />
        </button>
        {/* Поле даты прозрачное и лежит поверх подписи: формат даты не зависит от языка браузера */}
        <label className="day__picker">
          <span className="day__heading">{heading}</span>
          <span className="day__sub">
            {format(date, 'dd.MM.yyyy')} <Calendar width={13} height={13} />
          </span>
          <input
            type="date"
            value={dateKey}
            max={todayKey}
            onChange={(e) => e.target.value && e.target.value <= todayKey && onDateChange(e.target.value)}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch {
                /* браузер откроет календарь сам */
              }
            }}
            aria-label="Выбрать дату"
          />
        </label>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onDateChange(toKey(addDays(date, 1)))}
          disabled={dateKey >= todayKey}
          aria-label="Следующий день"
        >
          <ChevronRight />
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="muted">Здесь появятся поля для каждой активности, когда вы создадите первую.</p>
      ) : (
        <form onSubmit={submit} className="day__form" noValidate>
          {activities.map((a) => {
            const value = parsed[a.id];
            const shades = shadesFor(a, theme);
            const level = Number.isNaN(value) ? 0 : levelFor(value ?? undefined, a.thresholds);
            const bad = Number.isNaN(value);
            return (
              <div key={a.id} className={`day__row${bad ? ' is-invalid' : ''}`}>
                <span className="day__swatch" style={{ background: shades[level] }} title={`Уровень ${level} из ${a.thresholds.length}`} />
                <label htmlFor={`v-${a.id}`} className="day__label">
                  <span className="day__name">{a.name}</span>
                  <span className="day__unit">{a.unit}</span>
                </label>
                <input
                  id={`v-${a.id}`}
                  className="input day__input"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={draft[a.id] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                  aria-invalid={bad}
                />
              </div>
            );
          })}
          {invalid && <p className="error" role="alert">Введите число 0 или больше. Дробную часть можно писать через запятую.</p>}
          <div className="day__actions">
            <button type="submit" className="btn btn--primary" disabled={invalid || !dirty}>
              Сохранить
            </button>
            <span className="day__status" role="status">
              {savedAt === dateKey && !dirty ? 'Сохранено' : dirty ? 'Есть несохранённые изменения' : ''}
            </span>
          </div>
        </form>
      )}
    </section>
  );
}
