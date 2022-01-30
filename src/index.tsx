import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
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

ReactDOM.render(
    <React.StrictMode>
        <QueryClientProvider client={client}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);
