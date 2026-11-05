import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Шрифты раздаются вместе с приложением: без запросов к Google Fonts,
// которые блокируют приватные браузеры и расширения
import '@fontsource/golos-text/cyrillic-400.css';
import '@fontsource/golos-text/cyrillic-500.css';
import '@fontsource/golos-text/cyrillic-600.css';
import '@fontsource/golos-text/latin-400.css';
import '@fontsource/golos-text/latin-500.css';
import '@fontsource/golos-text/latin-600.css';
import '@fontsource/unbounded/cyrillic-500.css';
import '@fontsource/unbounded/cyrillic-600.css';
import '@fontsource/unbounded/latin-500.css';
import '@fontsource/unbounded/latin-600.css';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
