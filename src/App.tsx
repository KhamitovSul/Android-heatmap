import { useEffect, useMemo, useState } from 'react';
import type { Activity, Entries, ViewMode } from './types';
import { useStore } from './store/useStore';
import { useTheme } from './lib/theme';
import { fromKey, periodOf, periodPhrase, periodTitle, shiftAnchor } from './lib/dates';
import { useToday } from './lib/today';
import { PRESET_COLORS } from './lib/intensity';
import { Header } from './components/Header';
import { DayForm } from './components/DayForm';
import { Overview } from './components/Overview';
import { ActivityCard } from './components/ActivityCard';
import { ActivityDialog } from './components/ActivityDialog';
import { EmptyState } from './components/EmptyState';
import { BrowserNotice } from './components/BrowserNotice';
import { SettingsDialog } from './components/SettingsDialog';
import { Plus } from './components/icons';

type Editing = { activity: Activity | null } | null;

export default function App() {
  const {
    activities,
    entries,
    addActivity,
    updateActivity,
    deleteActivity,
    saveDay,
    loadDemo,
    replaceAll,
    timeZone,
    setTimeZone,
    storageNoticeDismissed,
    dismissStorageNotice,
  } = useStore();
  const { theme, toggle } = useTheme();

  const { today, todayKey } = useToday(timeZone);
  const [mode, setMode] = useState<ViewMode>('year');
  const [anchor, setAnchor] = useState(today);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [editing, setEditing] = useState<Editing>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Наступил новый день или сменился часовой пояс — переходим к «сегодня»
  useEffect(() => {
    setSelectedKey(todayKey);
    setAnchor(fromKey(todayKey));
  }, [todayKey]);

  const period = useMemo(() => periodOf(mode, anchor), [mode, anchor]);
  const isCurrent = today >= period.start && today <= period.end;
  const canGoNext = shiftAnchor(mode, period.start, 1) <= today;

  const selectDay = (key: string) => {
    setSelectedKey(key);
    // На узком экране форма над heatmap — прокручиваем к ней
    if (matchMedia('(max-width: 1000px)').matches)
      document.getElementById('day-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ version: 1, activities, entries }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `activity-heatmap-${todayKey}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { activities?: unknown; entries?: unknown };
      if (!Array.isArray(data.activities) || typeof data.entries !== 'object' || data.entries === null)
        throw new Error('в файле нет списка активностей или записей');
      if (confirm('Заменить текущие данные содержимым файла?'))
        replaceAll({ activities: data.activities as Activity[], entries: data.entries as Entries });
    } catch (err) {
      alert(`Не удалось загрузить файл: ${(err as Error).message}`);
    }
  };

  const demo = () => {
    if (activities.length === 0 || confirm('Заменить текущие данные примером?')) loadDemo(today);
  };

  const clearAll = () => {
    if (confirm('Удалить все активности и записи? Это действие нельзя отменить.')) replaceAll({ activities: [], entries: {} });
  };

  return (
    <div className="app">
      <Header
        mode={mode}
        onModeChange={setMode}
        title={periodTitle(mode, period)}
        onShift={(step) => setAnchor((a) => shiftAnchor(mode, a, step))}
        onToday={() => setAnchor(today)}
        isCurrent={isCurrent}
        canGoNext={canGoNext}
        theme={theme}
        onToggleTheme={toggle}
        onExport={exportData}
        onImport={importData}
        onDemo={demo}
        onClear={clearAll}
        onSettings={() => setSettingsOpen(true)}
      />

      <BrowserNotice
        timeZone={timeZone}
        storageNoticeDismissed={storageNoticeDismissed}
        onPickTimeZone={() => setSettingsOpen(true)}
        onExport={exportData}
        onDismissStorage={dismissStorageNotice}
      />

      <main className="layout">
        <aside className="layout__aside">
          <DayForm
            dateKey={selectedKey}
            todayKey={todayKey}
            onDateChange={setSelectedKey}
            activities={activities}
            entries={entries}
            theme={theme}
            onSave={saveDay}
          />
        </aside>

        <div className="layout__main">
          {activities.length === 0 ? (
            <EmptyState theme={theme} onCreate={() => setEditing({ activity: null })} onDemo={demo} />
          ) : (
            <>
              <Overview activities={activities} entries={entries} period={period} phrase={periodPhrase(mode, period)} today={today} />
              {activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  values={entries[a.id]}
                  mode={mode}
                  period={period}
                  theme={theme}
                  today={today}
                  todayKey={todayKey}
                  selectedKey={selectedKey}
                  onSelect={selectDay}
                  onEdit={() => setEditing({ activity: a })}
                />
              ))}
              <button type="button" className="add-activity" onClick={() => setEditing({ activity: null })}>
                <Plus /> Новая активность
              </button>
            </>
          )}
        </div>
      </main>

      {editing && (
        <ActivityDialog
          activity={editing.activity}
          defaultColor={PRESET_COLORS[activities.length % PRESET_COLORS.length]}
          theme={theme}
          onSubmit={(data) => (editing.activity ? updateActivity(editing.activity.id, data) : addActivity(data))}
          onDelete={editing.activity ? () => deleteActivity(editing.activity!.id) : undefined}
          onClose={() => setEditing(null)}
        />
      )}

      {settingsOpen && <SettingsDialog timeZone={timeZone} onSave={setTimeZone} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
