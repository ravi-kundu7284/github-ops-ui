/**
 * Application Entrypoint (`main.tsx`).
 *
 * Mounts the React 18 root component (`App`) into the DOM `#root` container
 * within React StrictMode, loading global Tailwind CSS styles.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
