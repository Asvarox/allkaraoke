import '~/modules/game-events/event-listeners';
import '~/modules/remote-mic/event-listeners';
import '~/modules/stats/index';
import '~/modules/utils/array-at-polyfill';
import '~/modules/utils/array-find-last-index-polyfill';
import '~/modules/utils/expose-singletons';
import '~/modules/utils/wdyr';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import {
  browserTracingIntegration,
  init,
  setUser,
  thirdPartyErrorFilterIntegration,
  withProfiler,
} from '@sentry/react';
import { MotionConfig } from 'motion/react';
import posthog from 'posthog-js';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { v4 } from 'uuid';

import App from '~/app';

import '~/index.css';
import NoPrerender from '~/modules/elements/no-prerender';
import { normalizeSting } from '~/modules/songs/utils/get-song-id';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';
import isPreRendering from '~/modules/utils/is-pre-rendering';
import { randomInt } from '~/modules/utils/random-value';
import sentryIgnoreErrors from '~/modules/utils/sentry-ignore-errors';
import storage from '~/modules/utils/storage';
import songStats from '~/routes/landing-page/song-stats.json';

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
    tunnel: '/stry-tunnel',
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

const LazyToastContainer = lazy(() =>
  import('react-toastify').then(({ ToastContainer }) => ({ default: ToastContainer })),
);

const AppWithProfiler = withProfiler(App);

root.render(
  <StrictMode>
    <MotionConfig transition={isE2E() ? { duration: 0.001 } : undefined} reducedMotion={isE2E() ? 'always' : undefined}>
      <CacheProvider value={emotionCache}>
        <AppWithProfiler />
        <NoPrerender>
          <Suspense>
            <LazyToastContainer position="bottom-left" theme={'colored'} limit={3} />
          </Suspense>
        </NoPrerender>
      </CacheProvider>
    </MotionConfig>
  </StrictMode>,
);
