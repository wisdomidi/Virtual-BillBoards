import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/webmcp';

// Auto-reload seamlessly when a new deployment rollout replaces JS bundles
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Deployment] Stale JS chunk detected after new rollout. Reloading fresh version...');
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('Failed to fetch dynamically imported module') ||
       event.message.includes('Importing a module script failed') ||
       event.message.includes('Loading chunk') ||
       event.message.includes('Unexpected token \'<\''))
    ) {
      const hasRetried = sessionStorage.getItem('vb_chunk_reload_retry');
      if (!hasRetried) {
        sessionStorage.setItem('vb_chunk_reload_retry', 'true');
        console.warn('[Deployment] Reloading latest app bundle...');
        window.location.reload();
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
