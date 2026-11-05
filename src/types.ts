export type ViewMode = 'week' | 'month' | 'year';

export type Theme = 'light' | 'dark';

export interface Activity {
  id: string;
  name: string;
  /** Единица измерения: «задачи», «шаги», «минуты» */
  unit: string;
  /** Базовый цвет heatmap, hex */
  color: string;
  /**
   * Нижние границы уровней по возрастанию, нижняя граница включается.
   * [1, 3, 6, 11] → 0 = пусто, 1–2 = уровень 1, 3–5 = 2, 6–10 = 3, 11+ = 4.
   */
  thresholds: number[];
  /** Свои цвета уровней (по одному на уровень). null — оттенки считаются из color. */
  shades: string[] | null;
}

/** entries[activityId]['2026-09-17'] = значение за день */
export type Entries = Record<string, Record<string, number>>;
