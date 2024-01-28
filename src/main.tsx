import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import 'GameEvents/eventListeners';
import 'Stats';
import 'utils/array-at-polyfill';
import 'utils/exposeSingletons';

import { init, setUser } from '@sentry/react';
import posthog from 'posthog-js';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import isDev from 'utils/isDev';
import isE2E from 'utils/isE2E';
import isPrerendering from 'utils/isPrerendering';
import { v4 } from 'uuid';
import App from './App';
import './index.css';

const isSentryEnabled = !!import.meta.env.VITE_APP_SENTRY_DSN_URL;

if (isSentryEnabled) {
  init({
    dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: isDev() ? 'development' : isE2E() ? 'e2e' : 'production',
    tunnel: import.meta.env.VITE_APP_SENTRY_TUNNEL,
  });
}

if (!isE2E() && import.meta.env.VITE_APP_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_APP_POSTHOG_KEY, {
    // debug: true,
    api_host: import.meta.env.VITE_APP_POSTHOG_PROXY,
    loaded: (ph) => {
      let storedUser = localStorage.getItem('posthog-user-id');
      if (!storedUser) {
        storedUser = v4();
        localStorage.setItem('posthog-user-id', storedUser);
      }
      ph.identify(storedUser);

      if (isSentryEnabled) {
        setUser({ id: storedUser });
      }
    },
  });
}

const emotionCache = createCache({
  key: 'emotion-cache-no-speedy',
  speedy: false,
});

const container = document.getElementById('root');

const root = createRoot(container!);

root.render(
  !isPrerendering ? (
    <>
      <App />
      <ToastContainer position={toast.POSITION.BOTTOM_LEFT} theme={'colored'} />
    </>
  ) : (
    <CacheProvider value={emotionCache}>
      <App />
      <ToastContainer position={toast.POSITION.BOTTOM_LEFT} theme={'colored'} />
    </CacheProvider>
  ),
);
