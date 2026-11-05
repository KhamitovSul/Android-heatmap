import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Относительные пути: сайт работает и на localhost, и по адресу вида user.github.io/activity-heatmap/
  base: './',
  // 5173 часто занят другими Vite-проектами — берём свой порт
  server: { port: 5280, open: true },
  preview: { port: 4280 },
  test: {
    environment: 'node',
  },
});
