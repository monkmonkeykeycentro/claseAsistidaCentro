import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { firebaseRuntime } from './config/firebaseRuntime';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="Error en la aplicación">
    {firebaseRuntime.useEmulators && (
      <div role="status" className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-950">
        Entorno local · Datos guardados en este equipo ·{' '}
        <a className="underline" href="http://127.0.0.1:4000" target="_blank" rel="noopener noreferrer">Abrir Firebase local</a>
      </div>
    )}
    <App />
  </ErrorBoundary>
);
