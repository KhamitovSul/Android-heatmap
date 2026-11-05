import { useMemo } from 'react';
import type { Activity, Theme, ViewMode } from '../types';
import type { Period } from '../lib/dates';
import { formatNumber, shadesFor } from '../lib/intensity';
import { statsFor } from '../lib/stats';
import { Heatmap } from './heatmap/Heatmap';
import { Legend } from './heatmap/Legend';
import { Settings } from './icons';

interface Props {
  activity: Activity;
  values: Record<string, number> | undefined;
  mode: ViewMode;
  period: Period;
  theme: Theme;
  today: Date;
  todayKey: string;
  selectedKey: string;
  onSelect: (key: string) => void;
  onEdit: () => void;
}

export function ActivityCard({ activity, values = {}, mode, period, theme, today, todayKey, selectedKey, onSelect, onEdit }: Props) {
  const shades = useMemo(() => shadesFor(activity, theme), [activity, theme]);
  const stats = useMemo(() => statsFor(values, period, today), [values, period, today]);

  return (
    <section className="activity" aria-label={activity.name}>
      <header className="activity__head">
        <div className="activity__title">
          <span className="swatch swatch--lg" style={{ background: activity.color }} />
          <h3>{activity.name}</h3>
          <span className="activity__unit">{activity.unit}</span>
        </div>
        <dl className="activity__kpis">
          <div>
            <dt>Всего</dt>
            <dd>{formatNumber(stats.total)}</dd>
          </div>
          <div>
            <dt>Дней</dt>
            <dd>{stats.activeDays}</dd>
          </div>
          <div>
            <dt>Лучший день</dt>
            <dd>{stats.best ? formatNumber(stats.best) : '—'}</dd>
          </div>
        </dl>
        <button type="button" className="icon-btn" onClick={onEdit} aria-label={`Настроить «${activity.name}»`} title="Настроить">
          <Settings />
        </button>
      </header>

      <Heatmap
        mode={mode}
        period={period}
        activity={activity}
        values={values}
        shades={shades}
        todayKey={todayKey}
        selectedKey={selectedKey}
        onSelect={onSelect}
      />

      <footer className="activity__foot">
        <span className="hint">Нажмите на день, чтобы изменить значение</span>
        <Legend activity={activity} shades={shades} />
      </footer>
    </section>
  );
}
