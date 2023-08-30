import '@fontsource/roboto';
import '@fontsource/roboto/900.css';
import 'GameEvents/eventListeners';
import 'Stats';
import 'utils/exposeSingletons';

import { init } from '@sentry/react';
import posthog from 'posthog-js';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import isDev from 'utils/isDev';
import isE2E from 'utils/isE2E';
import { v4 } from 'uuid';
import App from './App';
import './index.css';

if (import.meta.env.VITE_APP_SENTRY_DSN_URL) {
    init({
        dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        environment: isDev() ? 'development' : isE2E() ? 'e2e' : 'production',
        // tunnel: 'http://localhost:8080/sentry',
    });
}

if (!isE2E() && import.meta.env.VITE_APP_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_APP_POSTHOG_KEY, {
        debug: true,
        api_host: 'https://allkaraoke-posthog.fly.dev',
        test: isDev() || window.location.port !== '',
        loaded: (ph) => {
            let storedUser = localStorage.getItem('posthog-user-id');
            if (!storedUser) {
                storedUser = v4();
                localStorage.setItem('posthog-user-id', storedUser);
            }
            ph.identify(storedUser);
        },
    });
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <>
        <App />
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} theme={'colored'} />
    </>,
);
