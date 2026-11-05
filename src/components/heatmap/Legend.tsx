import type { Activity } from '../../types';
import { rangeLabel } from '../../lib/intensity';

interface Props {
  activity: Pick<Activity, 'thresholds' | 'unit'>;
  shades: string[];
}

/** «Меньше ■■■■■ Больше», как на GitHub; при наведении — диапазон уровня */
export function Legend({ activity, shades }: Props) {
  return (
    <div className="legend">
      <span>Меньше</span>
      {shades.map((c, level) => {
        const label = `${rangeLabel(activity.thresholds, level)} ${activity.unit}`.trim();
        return <span key={level} className="legend__cell" style={{ background: c }} title={label} aria-label={label} />;
      })}
      <span>Больше</span>
    </div>
  );
}
