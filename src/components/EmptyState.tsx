import { EMPTY_CELL } from '../lib/intensity';
import type { Theme } from '../types';
import { autoShades } from '../lib/intensity';

interface Props {
  theme: Theme;
  onCreate: () => void;
  onDemo: () => void;
}

export function EmptyState({ theme, onCreate, onDemo }: Props) {
  const shades = [EMPTY_CELL[theme], ...autoShades('#2a78d6', 4, theme)];
  const pattern = [0, 1, 2, 0, 3, 4, 2, 1, 0, 2, 3, 3, 4, 1, 0, 0, 2, 4, 3, 2, 1];
  return (
    <section className="empty">
      <div className="empty__art" aria-hidden="true">
        {pattern.map((l, i) => (
          <span key={i} style={{ background: shades[l] }} />
        ))}
      </div>
      <h2>Что будем отслеживать?</h2>
      <p>
        Создайте активность — например, решённые задачи, шаги или минуты чтения. Каждый вечер вносите результат, и клетки
        календаря окрасятся тем сильнее, чем больше вы сделали.
      </p>
      <div className="empty__actions">
        <button type="button" className="btn btn--primary" onClick={onCreate}>
          Создать активность
        </button>
        <button type="button" className="btn btn--ghost" onClick={onDemo}>
          Посмотреть на примере
        </button>
      </div>
    </section>
  );
}
