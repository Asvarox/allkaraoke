import '~/modules/game-events/event-listeners';
import '~/modules/remote-mic/event-listeners';
import '~/modules/stats/index';
import '~/modules/utils/array-at-polyfill';
import '~/modules/utils/array-find-last-index-polyfill';
import '~/modules/utils/expose-singletons';
import '~/modules/utils/wdyr';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { MotionConfig } from 'motion/react';
import posthog from 'posthog-js';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { v4 } from 'uuid';

import App from '~/app';

import '~/index.css';
import NoPrerender from '~/modules/elements/no-prerender';
import { normalizeSting } from '~/modules/songs/utils/get-song-id';
import isE2E from '~/modules/utils/is-e2-e';
import isPreRendering from '~/modules/utils/is-pre-rendering';
import { randomInt } from '~/modules/utils/random-value';
import storage from '~/modules/utils/storage';
import songStats from '~/routes/landing-page/song-stats.json';

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

root.render(
  <StrictMode>
    <MotionConfig transition={isE2E() ? { duration: 0.001 } : undefined} reducedMotion={isE2E() ? 'always' : undefined}>
      <CacheProvider value={emotionCache}>
        <App />
        <NoPrerender>
          <Suspense>
            <LazyToastContainer position="bottom-left" theme={'colored'} limit={3} />
          </Suspense>
        </NoPrerender>
      </CacheProvider>
    </MotionConfig>
  </StrictMode>,
);
