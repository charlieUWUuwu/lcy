import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 自定義全域 CSS
import App from './App.tsx';
import './index.css';
import './styles/style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
