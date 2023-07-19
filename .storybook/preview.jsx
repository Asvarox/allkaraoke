import { Global } from '@emotion/react';
import { useMemo } from 'react';
import styles from '../src/styles';
import '../src/index.css';
import { createTheme, ThemeProvider } from '@mui/material';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

export const decorators = [
    (Story) => {
        const theme = useMemo(
            () =>
                createTheme({
                    graphicSetting: 'high',
                }),
            [],
        );
        return (
            <ThemeProvider theme={theme}>
                <Global styles={styles({ theme })} />
                <Story />
            </ThemeProvider>
        );
    },
];
