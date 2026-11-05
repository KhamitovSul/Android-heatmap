# Android heatmap

Офлайн-приложение для Android на основе Activity Heatmap. Интерфейс, календарные
тепловые карты, статистика, настройки и работа с данными такие же, как в исходном
приложении.

## Офлайн-режим и данные

- Интерфейс, шрифты и логика входят в APK; для запуска не нужен интернет.
- Сетевое разрешение Android-приложению не запрашивается.
- Активности, записи, тема и часовой пояс сохраняются локально в хранилище
  приложения на устройстве. Данные не отправляются на сервер.
- Меню **Данные** позволяет экспортировать копию в JSON и восстановить её из файла.
- Удаление приложения или очистка его данных Android удалит сохранённую историю.
  Экспортируйте резервную копию, если хотите перенести её на другое устройство.

## Сборка APK в Windows

Нужны Node.js 20+, Android Studio и Android SDK. В Android Studio установите
Android SDK Platform и Build-Tools, а также JDK 21 (Android Studio включает
подходящую Java). Откройте PowerShell в папке проекта и выполните:

```powershell
npm install
npm run android:apk
```

Готовый отладочный APK появится здесь:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

Для установки на подключённое устройство с включённой отладкой по USB:

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

После изменений веб-интерфейса повторно выполните `npm run android:apk`.

## Разработка интерфейса

```powershell
npm run dev
npm test
npm run build
```

## Технологии

- React + TypeScript + Vite
- Zustand с локальным `localStorage` внутри Android WebView
- Capacitor Android
- date-fns для календаря и статистики
