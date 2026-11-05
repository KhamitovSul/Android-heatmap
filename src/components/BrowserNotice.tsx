import { isGecko, timeZoneLooksSpoofed } from '../lib/today';

interface Props {
  timeZone: string | null;
  storageNoticeDismissed: boolean;
  onPickTimeZone: () => void;
  onExport: () => void;
  onDismissStorage: () => void;
}

/**
 * Подсказки для LibreWolf и Firefox с усиленной приватностью:
 * подмена часового пояса и удаление данных сайтов при закрытии браузера.
 */
export function BrowserNotice({ timeZone, storageNoticeDismissed, onPickTimeZone, onExport, onDismissStorage }: Props) {
  const needTimeZone = timeZone === null && timeZoneLooksSpoofed();
  const needStorage = isGecko() && !storageNoticeDismissed;
  if (!needTimeZone && !needStorage) return null;

  return (
    <div className="notices">
      {needTimeZone && (
        <section className="notice" aria-label="Часовой пояс">
          <div>
            <h3>Браузер скрывает часовой пояс</h3>
            <p>
              LibreWolf сообщает сайтам время по UTC, поэтому новый день здесь начинался бы не в вашу полночь. Укажите свой
              пояс — «сегодня» будет считаться по нему.
            </p>
          </div>
          <div className="notice__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={onPickTimeZone}>
              Указать пояс
            </button>
          </div>
        </section>
      )}
      {needStorage && (
        <section className="notice" aria-label="Сохранность данных">
          <div>
            <h3>Записи могут удалиться при закрытии браузера</h3>
            <p>
              LibreWolf по умолчанию стирает данные сайтов при выходе. Чтобы записи сохранялись, добавьте сайт в исключения:
              Настройки → Приватность и защита → Куки и данные сайтов → Управление исключениями →{' '}
              <code>{location.origin}</code> → Разрешить.
            </p>
          </div>
          <div className="notice__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onExport}>
              Скачать копию
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={onDismissStorage}>
              Исключение добавлено
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
