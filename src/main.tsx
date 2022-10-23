import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import isDev from 'utils/isDev';
import App from './App';
import './index.css';

if (import.meta.env.VITE_APP_SENTRY_DSN_URL) {
    Sentry.init({
        dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        // @ts-expect-error
        environment: isDev() ? 'development' : window.isE2ETests ? 'e2e' : 'production',
    });
}

const client = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container!);

events.phoneConnected.subscribe(({ name }) => {
    toast.success(
        <>
            Remote microphone <b>{name}</b> connected!
        </>,
    );
});
events.phoneDisconnected.subscribe(({ name }) => {
    toast.error(
        <>
            Remote microphone <b>{name}</b> disconnected!
        </>,
    );
});

root.render(
    // <React.StrictMode>
    <QueryClientProvider client={client}>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} theme={'colored'} />
    </QueryClientProvider>,
    // </React.StrictMode>
);
