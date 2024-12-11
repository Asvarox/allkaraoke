import 'modules/GameEvents/eventListeners';
import 'modules/RemoteMic/eventListeners';
import 'modules/Stats';
import 'modules/utils/array-at-polyfill';
import 'modules/utils/array-findLastIndex-polyfill';
import 'modules/utils/exposeSingletons';
import 'modules/utils/wdyr';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { browserTracingIntegration, init, setUser, thirdPartyErrorFilterIntegration } from '@sentry/react';
import App from 'App';
import 'index.css';
import { normalizeSting } from 'modules/Songs/utils/getSongId';
import isDev from 'modules/utils/isDev';
import isE2E from 'modules/utils/isE2E';
import isPreRendering from 'modules/utils/isPreRendering';
import { randomInt } from 'modules/utils/randomValue';
import sentryIgnoreErrors from 'modules/utils/sentryIgnoreErrors';
import storage from 'modules/utils/storage';
import posthog from 'posthog-js';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import songStats from 'routes/LandingPage/songStats.json';
import { v4 } from 'uuid';

const isSentryEnabled = !!import.meta.env.VITE_APP_SENTRY_DSN_URL;

if (isSentryEnabled) {
  init({
    integrations: [
      browserTracingIntegration({
        enableInp: true,
      }),
      thirdPartyErrorFilterIntegration({
        // Specify the application keys that you specified in the Sentry bundler plugin
        filterKeys: ['allkaraoke-party-sentry-key'],

        // Defines how to handle errors that contain third party stack frames.
        // Possible values are:
        // - 'drop-error-if-contains-third-party-frames'
        // - 'drop-error-if-exclusively-contains-third-party-frames'
        // - 'apply-tag-if-contains-third-party-frames'
        // - 'apply-tag-if-exclusively-contains-third-party-frames'
        behaviour: 'apply-tag-if-contains-third-party-frames',
      }),
    ],

    dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,
    ignoreErrors: sentryIgnoreErrors,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: isE2E() ? 0 : 0.01,
    environment: isDev() ? 'development' : isE2E() ? 'e2e' : 'production',
    tunnel: import.meta.env.VITE_APP_SENTRY_TUNNEL,
  });
}

if (!isE2E() && import.meta.env.VITE_APP_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_APP_POSTHOG_KEY, {
    // debug: true,
    api_host: '/ph-data',
    loaded: (ph) => {
      let storedUser = storage.local.getItem('posthog-user-id');
      if (!storedUser) {
        storedUser = v4();
        storage.local.setItem('posthog-user-id', storedUser);
      }
      ph.identify(storedUser);
      let storedName = storage.local.getItem('posthog-user-name');
      if (!storedName) {
        const words = [...new Set(songStats.artists.flatMap((artist) => normalizeSting(artist).split('-')))].filter(
          (word) => word.length <= 10,
        );

        storedName = new Array(randomInt(3, 5))
          .fill(0)
          .map(() => words[randomInt(0, words.length - 1)])
          .join('-');
        storage.local.setItem('posthog-user-name', storedName);

        ph.alias(storedName, storedUser);
      }

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
    <ToastContainer position="bottom-left" theme={'colored'} limit={3} />
  </CacheProvider>,
);
