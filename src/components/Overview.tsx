import { useMemo, useState } from 'react';
import type { Activity, Entries } from '../types';
import type { Period } from '../lib/dates';
import { overallActiveDays, statsFor } from '../lib/stats';
import { formatNumber } from '../lib/intensity';
import { RadialRings } from './RadialRings';

interface Props {
  activities: Activity[];
  entries: Entries;
  period: Period;
  phrase: string;
  today: Date;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const days = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} день`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} дня`;
  return `${n} дней`;
};

export function Overview({ activities, entries, period, phrase, today }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const rows = useMemo(
    () => activities.map((a) => ({ activity: a, stats: statsFor(entries[a.id], period, today) })),
    [activities, entries, period, today],
  );
  const overall = useMemo(
    () => overallActiveDays(activities, entries, period, today),
    [activities, entries, period, today],
  );

  const rings = rows.map(({ activity, stats }) => ({
    id: activity.id,
    label: activity.name,
    color: activity.color,
    value: stats.rate,
    title: `${activity.name}: ${pct(stats.rate)} дней (${stats.activeDays} из ${stats.elapsedDays})`,
  }));

  return (
    <section className="overview" aria-labelledby="overview-title">
      <div className="overview__intro">
        <h2 id="overview-title">Общая регулярность</h2>
        <p>
          Доля дней с записью {phrase}. Внешнее кольцо — первая активность в списке.
        </p>
      </div>

      <div className="overview__body">
        <RadialRings
          rings={rings}
          centerValue={overall.elapsedDays ? pct(overall.rate) : '—'}
          centerLabel="активных дней"
          activeId={active}
          onHover={setActive}
        />

        <table className="stats">
          <thead>
            <tr>
              <th scope="col">Активность</th>
              <th scope="col">Регулярность</th>
              <th scope="col">Всего</th>
              <th scope="col">Серия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ activity, stats }) => (
              <tr
                key={activity.id}
                className={active === activity.id ? 'is-active' : undefined}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(activity.id)}
                onPointerLeave={() => setActive(null)}
              >
                <th scope="row">
                  <span className="swatch" style={{ background: activity.color }} />
                  {activity.name}
                </th>
                <td>
                  <strong>{pct(stats.rate)}</strong>
                  <small>
                    {stats.activeDays} из {days(stats.elapsedDays)}
                  </small>
                </td>
                <td>
                  <strong>{formatNumber(stats.total)}</strong>
                  <small>{activity.unit}</small>
                </td>
                <td>
                  <strong>{days(stats.currentStreak)}</strong>
                  <small>рекорд: {stats.longestStreak}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="overview__total">
        Хотя бы одна активность была в {overall.activeDays} из {days(overall.elapsedDays)} {phrase}.
      </p>
    </section>
  );
}
