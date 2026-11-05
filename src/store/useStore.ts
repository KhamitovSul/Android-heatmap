import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, Entries } from '../types';
import { demoData } from '../lib/demo';

interface State {
  activities: Activity[];
  entries: Entries;
  addActivity: (data: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, data: Omit<Activity, 'id'>) => void;
  deleteActivity: (id: string) => void;
  /** Сохранить значения всех активностей за день. null — удалить запись. */
  saveDay: (dateKey: string, values: Record<string, number | null>) => void;
  loadDemo: (today: Date) => void;
  /** Часовой пояс для «сегодня»; null — как в браузере */
  timeZone: string | null;
  setTimeZone: (tz: string | null) => void;
  storageNoticeDismissed: boolean;
  dismissStorageNotice: () => void;
  replaceAll: (data: { activities: Activity[]; entries: Entries }) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      activities: [],
      entries: {},

      addActivity: (data) =>
        set((s) => {
          const id = crypto.randomUUID();
          return {
            activities: [...s.activities, { ...data, id }],
            entries: { ...s.entries, [id]: {} },
          };
        }),

      updateActivity: (id, data) =>
        set((s) => ({
          activities: s.activities.map((a) => (a.id === id ? { ...data, id } : a)),
        })),

      deleteActivity: (id) =>
        set((s) => {
          const { [id]: _removed, ...entries } = s.entries;
          return { activities: s.activities.filter((a) => a.id !== id), entries };
        }),

      saveDay: (dateKey, values) =>
        set((s) => {
          const entries = { ...s.entries };
          for (const [activityId, value] of Object.entries(values)) {
            const days = { ...entries[activityId] };
            if (value === null || value <= 0) delete days[dateKey];
            else days[dateKey] = value;
            entries[activityId] = days;
          }
          return { entries };
        }),

      loadDemo: (today) => set(demoData(today)),

      timeZone: null,
      setTimeZone: (timeZone) => set({ timeZone }),
      storageNoticeDismissed: false,
      dismissStorageNotice: () => set({ storageNoticeDismissed: true }),

      replaceAll: (data) => set({ activities: data.activities, entries: data.entries }),
    }),
    { name: 'activity-heatmap', version: 1 },
  ),
);
