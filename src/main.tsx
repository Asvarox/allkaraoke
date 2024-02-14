import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import 'GameEvents/eventListeners';
import 'Stats';
import 'utils/array-at-polyfill';
import 'utils/exposeSingletons';

import { BrowserTracing, init, setUser } from '@sentry/react';
import posthog from 'posthog-js';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import isDev from 'utils/isDev';
import isE2E from 'utils/isE2E';
import isPreRendering from 'utils/isPreRendering';
import sentryIgnoreErrors from 'utils/sentryIgnoreErrors';
import { v4 } from 'uuid';
import App from './App';
import './index.css';

const isSentryEnabled = !!import.meta.env.VITE_APP_SENTRY_DSN_URL;

if (isSentryEnabled) {
  init({
    integrations: [new BrowserTracing()],

    dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,
    ignoreErrors: sentryIgnoreErrors,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
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
  // posthog.featureFlags.override({ websockets_remote_mics: false });
}

// https://github.com/emotion-js/emotion/issues/2404
const emotionCache = createCache({
  key: 'ec',
  speedy: !isPreRendering,
});

const container = document.getElementById('root');

const root = createRoot(container!);

root.render(
  <CacheProvider value={emotionCache}>
    <App />
    <ToastContainer position={toast.POSITION.BOTTOM_LEFT} theme={'colored'} />
  </CacheProvider>,
);
