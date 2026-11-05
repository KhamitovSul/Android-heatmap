import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { Activity, Theme } from '../types';
import { MAX_LEVELS, PRESET_COLORS, autoShades, shadesFor, validateThresholds } from '../lib/intensity';
import { Legend } from './heatmap/Legend';
import { Close, Plus } from './icons';

interface Props {
  /** null — создаём новую активность */
  activity: Activity | null;
  defaultColor: string;
  theme: Theme;
  onSubmit: (data: Omit<Activity, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const DEFAULT_THRESHOLDS = ['1', '3', '6', '11'];
const num = (s: string) => Number(s.trim().replace(',', '.'));

export function ActivityDialog({ activity, defaultColor, theme, onSubmit, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(activity?.name ?? '');
  const [unit, setUnit] = useState(activity?.unit ?? '');
  const [color, setColor] = useState(activity?.color ?? defaultColor);
  const [thresholds, setThresholds] = useState<string[]>(activity?.thresholds.map(String) ?? DEFAULT_THRESHOLDS);
  const [custom, setCustom] = useState<string[] | null>(activity?.shades ?? null);
  const [error, setError] = useState('');

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const levels = thresholds.length;
  // Свои цвета всегда той же длины, что и шкала
  const customFitted = custom
    ? Array.from({ length: levels }, (_, i) => custom[i] ?? autoShades(color, levels, theme)[i])
    : null;

  const preview: Activity = {
    id: 'preview',
    name,
    unit,
    color,
    thresholds: thresholds.map(num),
    shades: customFitted,
  };
  const shades = shadesFor(preview, theme);

  // Небольшой образец heatmap: 18 недель с «волнами» активности
  const sample = useMemo(
    () =>
      Array.from({ length: 18 * 7 }, (_, i) => {
        const wave = (Math.sin(i / 9) + Math.sin(i / 3.7) * 0.6 + 1.6) / 3.2;
        return i % 11 === 5 ? 0 : Math.round(wave * levels);
      }),
    [levels],
  );

  const setThreshold = (i: number, v: string) => setThresholds((t) => t.map((x, j) => (j === i ? v : x)));

  const addLevel = () =>
    setThresholds((t) => {
      const last = num(t[t.length - 1] ?? '0') || 1;
      return [...t, String(Number.isInteger(last) ? last * 2 : +(last * 2).toFixed(2))];
    });

  const removeLevel = (i: number) => {
    setThresholds((t) => t.filter((_, j) => j !== i));
    setCustom((c) => (c ? c.filter((_, j) => j !== i) : c));
  };

  const toggleCustom = (on: boolean) => setCustom(on ? autoShades(color, levels, theme) : null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const values = thresholds.map(num);
    if (!name.trim()) return setError('Введите название активности.');
    const problem = validateThresholds(values);
    if (problem) return setError(problem);
    onSubmit({ name: name.trim(), unit: unit.trim(), color, thresholds: values, shades: customFitted });
    ref.current?.close();
  };

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="dialog-title">
      <form onSubmit={submit} noValidate>
        <header className="dialog__head">
          <h2 id="dialog-title">{activity ? 'Настройки активности' : 'Новая активность'}</h2>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Закрыть">
            <Close />
          </button>
        </header>

        <div className="dialog__body">
          <div className="field-row">
            <label className="field">
              <span>Название</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Программирование" autoFocus />
            </label>
            <label className="field">
              <span>Единица измерения</span>
              <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="задачи" />
            </label>
          </div>

          <fieldset className="field">
            <legend>Цвет</legend>
            <div className="colors">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="color-dot"
                  style={{ background: c }}
                  aria-label={`Цвет ${c}`}
                  aria-pressed={color === c}
                  onClick={() => {
                    setColor(c);
                    if (custom) setCustom(autoShades(c, levels, theme));
                  }}
                />
              ))}
              <label className="color-custom" title="Свой цвет">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (custom) setCustom(autoShades(e.target.value, levels, theme));
                  }}
                />
                <span>Свой</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Шкала интенсивности</legend>
            <p className="muted small">
              Уровень начинается с указанного значения включительно. Всё, что меньше первой границы, остаётся пустым.
            </p>
            <ol className="levels">
              <li className="levels__row">
                <span className="levels__swatch" style={{ background: shades[0] }} />
                <span className="levels__name">Пусто</span>
                <span className="levels__range muted">меньше {thresholds[0] || '…'}</span>
              </li>
              {thresholds.map((t, i) => (
                <li key={i} className="levels__row">
                  {customFitted ? (
                    <input
                      type="color"
                      className="levels__picker"
                      value={customFitted[i]}
                      onChange={(e) => setCustom(customFitted.map((c, j) => (j === i ? e.target.value : c)))}
                      aria-label={`Цвет уровня ${i + 1}`}
                    />
                  ) : (
                    <span className="levels__swatch" style={{ background: shades[i + 1] }} />
                  )}
                  <span className="levels__name">Уровень {i + 1}</span>
                  <label className="levels__input">
                    <span>от</span>
                    <input className="input" inputMode="decimal" value={t} onChange={(e) => setThreshold(i, e.target.value)} aria-label={`Нижняя граница уровня ${i + 1}`} />
                    <span className="muted">{unit}</span>
                  </label>
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm"
                    onClick={() => removeLevel(i)}
                    disabled={levels <= 1}
                    aria-label={`Удалить уровень ${i + 1}`}
                  >
                    <Close />
                  </button>
                </li>
              ))}
            </ol>
            <div className="levels__tools">
              <button type="button" className="btn btn--ghost btn--sm" onClick={addLevel} disabled={levels >= MAX_LEVELS}>
                <Plus /> Добавить уровень
              </button>
              <label className="check">
                <input type="checkbox" checked={custom !== null} onChange={(e) => toggleCustom(e.target.checked)} />
                Выбрать оттенки вручную
              </label>
            </div>
          </fieldset>

          <div className="preview" aria-hidden="true">
            <div className="preview__grid">
              {sample.map((lvl, i) => (
                <span key={i} style={{ background: shades[Math.min(lvl, levels)] }} />
              ))}
            </div>
            <Legend activity={preview} shades={shades} />
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="dialog__foot">
          {activity && onDelete && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                if (confirm(`Удалить «${activity.name}» вместе со всеми записями?`)) {
                  onDelete();
                  ref.current?.close();
                }
              }}
            >
              Удалить
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={() => ref.current?.close()}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {activity ? 'Сохранить изменения' : 'Создать активность'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
