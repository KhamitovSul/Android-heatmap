import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { allTimeZones, browserTimeZone, timeZoneLooksSpoofed, todayKeyIn } from '../lib/today';
import { fromKey, longDate } from '../lib/dates';
import { Close } from './icons';

interface Props {
  timeZone: string | null;
  onSave: (tz: string | null) => void;
  onClose: () => void;
}

const AUTO = '';

export function SettingsDialog({ timeZone, onSave, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const zones = useMemo(allTimeZones, []);
  const spoofed = timeZoneLooksSpoofed();
  const [value, setValue] = useState(timeZone ?? (spoofed ? 'Asia/Almaty' : AUTO));

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(value === AUTO ? null : value);
    ref.current?.close();
  };

  const previewKey = todayKeyIn(value === AUTO ? null : value);

  return (
    <dialog ref={ref} className="dialog dialog--narrow" onClose={onClose} aria-labelledby="settings-title">
      <form onSubmit={submit}>
        <header className="dialog__head">
          <h2 id="settings-title">Часовой пояс</h2>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Закрыть">
            <Close />
          </button>
        </header>
        <div className="dialog__body">
          <p className="small muted">
            По нему определяется «сегодня» и момент, когда начинается новый день.
            {spoofed &&
              ` Браузер сообщает пояс ${browserTimeZone()} — так делают LibreWolf и Firefox с защитой от отслеживания, поэтому лучше указать пояс вручную.`}
          </p>
          <label className="field">
            <span>Пояс</span>
            <select className="input" value={value} onChange={(e) => setValue(e.target.value)}>
              <option value={AUTO}>Как в браузере ({browserTimeZone()})</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <p className="small">
            Сейчас там: <strong>{longDate(fromKey(previewKey))}</strong>
          </p>
        </div>
        <footer className="dialog__foot">
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={() => ref.current?.close()}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            Сохранить
          </button>
        </footer>
      </form>
    </dialog>
  );
}
