import { useEffect, useState } from 'react';

export interface Ring {
  id: string;
  label: string;
  color: string;
  /** Заполненность кольца 0..1 */
  value: number;
  title: string;
}

interface Props {
  rings: Ring[];
  centerValue: string;
  centerLabel: string;
  activeId: string | null;
  onHover: (id: string | null) => void;
}

const SIZE = 248;
const C = SIZE / 2;
const OUTER = 118;
const INNER_MIN = 58; // место под число в центре
const GAP = 4;

/** Концентрические кольца: одно кольцо — одна активность */
export function RadialRings({ rings, centerValue, centerLabel, activeId, onHover }: Props) {
  // Кольца «дорисовываются» после первого показа и при смене периода
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const n = Math.max(rings.length, 1);
  const width = Math.max(6, Math.min(18, (OUTER - INNER_MIN) / n - GAP));

  return (
    <svg
      className="rings"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${centerLabel}: ${centerValue}`}
      onPointerLeave={() => onHover(null)}
    >
      {rings.map((ring, i) => {
        const r = OUTER - width / 2 - i * (width + GAP);
        const len = 2 * Math.PI * r;
        const value = Math.min(1, Math.max(0, ring.value));
        const dim = activeId !== null && activeId !== ring.id;
        return (
          <g
            key={ring.id}
            className={`ring${dim ? ' ring--dim' : ''}`}
            onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(ring.id)}
          >
            <title>{ring.title}</title>
            <circle className="ring__track" cx={C} cy={C} r={r} strokeWidth={width} />
            {value > 0 && (
              <circle
                className="ring__arc"
                cx={C}
                cy={C}
                r={r}
                stroke={ring.color}
                strokeWidth={width}
                // через style, а не атрибут: так переход анимируется одинаково в Firefox и Chromium
                style={{ strokeDasharray: `${len} ${len}`, strokeDashoffset: drawn ? len * (1 - value) : len }}
                transform={`rotate(-90 ${C} ${C})`}
              />
            )}
          </g>
        );
      })}
      <text className="rings__value" x={C} y={C + 4} textAnchor="middle">
        {centerValue}
      </text>
      <text className="rings__label" x={C} y={C + 24} textAnchor="middle">
        {centerLabel}
      </text>
    </svg>
  );
}
