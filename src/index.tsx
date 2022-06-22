import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';
import './index.css';

if (process.env.REACT_APP_SENTRY_DSN_URL) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN_URL,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
}

const client = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    // <React.StrictMode>
    <QueryClientProvider client={client}>
        <App />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>,
    // </React.StrictMode>
);
