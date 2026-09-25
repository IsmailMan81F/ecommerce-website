import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof document !== 'undefined') {
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('touch-action');
  document.documentElement.style.removeProperty('touch-action');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
