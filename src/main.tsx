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
import isPreRendering from 'utils/isPreRendering';
import { v4 } from 'uuid';
import App from './App';
import './index.css';

const isSentryEnabled = !!import.meta.env.VITE_APP_SENTRY_DSN_URL;

if (isSentryEnabled) {
  init({
    dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications.',
      'NotAllowedError: Document is not focused.',
      'Error: Socket was destroyed!',
      /TypeError: Failed to fetch/,
      // https://docs.sentry.io/platforms/javascript/configuration/filtering/#using--1
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
      // reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
    ],

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
  posthog.featureFlags.override({ websockets_remote_mics: false });
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
