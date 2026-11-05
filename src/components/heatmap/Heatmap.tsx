import { useMemo, useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Activity, ViewMode } from '../../types';
import { WEEKDAYS_SHORT, fromKey, longDate, monthLabels, weeksOf, type Cell, type Period } from '../../lib/dates';
import { formatNumber, levelFor } from '../../lib/intensity';
import { readableOn } from '../../lib/color';

interface Props {
  mode: ViewMode;
  period: Period;
  activity: Activity;
  values: Record<string, number>;
  /** [0] — пустая ячейка, [1..n] — уровни */
  shades: string[];
  todayKey: string;
  selectedKey: string;
  onSelect: (key: string) => void;
}

interface Tip {
  text: string;
  x: number;
  y: number;
}

export function Heatmap({ mode, period, activity, values, shades, todayKey, selectedKey, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const weeks = useMemo(() => weeksOf(period), [period]);

  const describe = (key: string) => {
    const v = values[key];
    return `${longDate(fromKey(key))} — ${v ? `${formatNumber(v)} ${activity.unit}` : 'нет записи'}`;
  };

  // Одна подсказка на всю сетку: ищем ячейку под курсором по data-key
  const showTip = (e: SyntheticEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-key]');
    const wrap = wrapRef.current;
    if (!cell || !wrap) return setTip(null);
    const w = wrap.getBoundingClientRect();
    const r = cell.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2 - w.left, 90), w.width - 90);
    setTip({ text: describe(cell.dataset.key!), x, y: r.top - w.top });
  };

  const select = (e: SyntheticEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-key]');
    if (cell && !cell.disabled) onSelect(cell.dataset.key!);
  };

  const cellStyle = (cell: Cell): { level: number; style: CSSProperties } => {
    const level = levelFor(values[cell.key], activity.thresholds);
    const bg = shades[level];
    return { level, style: { background: bg, color: level > 0 ? readableOn(bg) : undefined } };
  };

  const cellClass = (cell: Cell, level: number, extra: string) =>
    [
      'cell',
      extra,
      level > 0 && 'cell--filled',
      cell.key === todayKey && 'cell--today',
      cell.key === selectedKey && 'cell--selected',
    ]
      .filter(Boolean)
      .join(' ');

  const renderCell = (cell: Cell, extra: string, content?: (level: number) => ReactNode) => {
    if (!cell.inPeriod) return <span key={cell.key} className={`cell ${extra} cell--pad`} aria-hidden="true" />;
    const future = cell.key > todayKey;
    const { level, style } = cellStyle(cell);
    return (
      <button
        key={cell.key}
        type="button"
        data-key={cell.key}
        className={cellClass(cell, level, extra) + (future ? ' cell--future' : '')}
        style={future ? undefined : style}
        disabled={future}
        aria-label={describe(cell.key)}
        aria-pressed={cell.key === selectedKey}
      >
        {content?.(level)}
      </button>
    );
  };

  // Сетку пересобираем только при смене данных, а не при каждом показе подсказки
  const body = useMemo((): ReactNode => {
    if (mode === 'year') {
      const labels = monthLabels(weeks);
      return (
        <div className="year" style={{ '--cols': weeks.length } as CSSProperties}>
          <div className="year__months" aria-hidden="true">
            {labels.map((l) => (
              <span key={l.label} style={{ gridColumn: l.column + 1 }}>
                {l.label}
              </span>
            ))}
          </div>
          <div className="year__weekdays" aria-hidden="true">
            {WEEKDAYS_SHORT.map((d, i) => (
              <span key={d}>{i % 2 === 0 && i < 6 ? d : ''}</span>
            ))}
          </div>
          <div className="year__grid">{weeks.flat().map((c) => renderCell(c, 'cell--year'))}</div>
        </div>
      );
    } else if (mode === 'month') {
      return (
        <div className="month">
          {WEEKDAYS_SHORT.map((d) => (
            <span key={d} className="month__weekday" aria-hidden="true">
              {d}
            </span>
          ))}
          {weeks.flat().map((c) =>
            renderCell(c, 'cell--month', () => (
              <>
                <span className="cell__day">{c.date.getDate()}</span>
                {values[c.key] ? <span className="cell__value">{formatNumber(values[c.key])}</span> : null}
              </>
            )),
          )}
        </div>
      );
    } else {
      return (
        <div className="week">
          {weeks[0].map((c) =>
            renderCell(c, 'cell--week', () => (
              <>
                <span className="cell__weekday">{WEEKDAYS_SHORT[(c.date.getDay() + 6) % 7]}</span>
                <span className="cell__date">{format(c.date, 'd MMM', { locale: ru })}</span>
                <span className="cell__big">{values[c.key] ? formatNumber(values[c.key]) : '—'}</span>
                <span className="cell__unit">{values[c.key] ? activity.unit : ''}</span>
              </>
            )),
          )}
        </div>
      );
    }
  }, [mode, weeks, values, shades, todayKey, selectedKey, activity]);

  return (
    <div
      ref={wrapRef}
      className="heatmap"
      onPointerOver={showTip}
      onPointerLeave={() => setTip(null)}
      onFocus={showTip}
      onBlur={() => setTip(null)}
      onClick={select}
    >
      <div className="heatmap__scroll">{body}</div>
      {tip && (
        <div className="tooltip" role="presentation" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}
