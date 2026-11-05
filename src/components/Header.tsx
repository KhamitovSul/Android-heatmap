import { useRef, type ChangeEvent } from 'react';
import type { Theme, ViewMode } from '../types';
import { ChevronLeft, ChevronRight, Logo, Moon, Sun } from './icons';

interface Props {
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  title: string;
  onShift: (step: number) => void;
  onToday: () => void;
  isCurrent: boolean;
  canGoNext: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onDemo: () => void;
  onClear: () => void;
  onSettings: () => void;
}

const MODES: { value: ViewMode; label: string }[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
];

export function Header(p: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menuRef.current?.removeAttribute('open');

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) p.onImport(file);
    e.target.value = '';
  };

  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <span>Activity Heatmap</span>
      </div>

      <nav className="topbar__controls" aria-label="Период">
        <div className="segmented" role="group" aria-label="Масштаб">
          {MODES.map((m) => (
            <button key={m.value} type="button" aria-pressed={p.mode === m.value} onClick={() => p.onModeChange(m.value)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="period">
          <button type="button" className="icon-btn" onClick={() => p.onShift(-1)} aria-label="Предыдущий период">
            <ChevronLeft />
          </button>
          <span className="period__title" aria-live="polite">
            {p.title}
          </span>
          <button type="button" className="icon-btn" onClick={() => p.onShift(1)} disabled={!p.canGoNext} aria-label="Следующий период">
            <ChevronRight />
          </button>
        </div>

        <button type="button" className="btn btn--ghost btn--sm" onClick={p.onToday} disabled={p.isCurrent}>
          Сегодня
        </button>
      </nav>

      <div className="topbar__tools">
        <details className="menu" ref={menuRef}>
          <summary className="btn btn--ghost btn--sm">Данные</summary>
          <div className="menu__list" role="menu">
            <button type="button" role="menuitem" onClick={() => { closeMenu(); p.onExport(); }}>
              Скачать копию (JSON)
            </button>
            <button type="button" role="menuitem" onClick={() => { closeMenu(); fileRef.current?.click(); }}>
              Загрузить из файла
            </button>
            <button type="button" role="menuitem" onClick={() => { closeMenu(); p.onSettings(); }}>
              Часовой пояс
            </button>
            <button type="button" role="menuitem" onClick={() => { closeMenu(); p.onDemo(); }}>
              Заполнить примером
            </button>
            <button type="button" role="menuitem" className="danger" onClick={() => { closeMenu(); p.onClear(); }}>
              Удалить все данные
            </button>
          </div>
        </details>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={pick} />
        <button
          type="button"
          className="icon-btn"
          onClick={p.onToggleTheme}
          aria-label={p.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          title={p.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {p.theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  );
}
