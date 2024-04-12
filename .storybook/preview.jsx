import { Global } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import '../src/index.css';
import styles from '../src/styles';

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
        <Global styles={styles} />
        <Story />
      </ThemeProvider>
    );
  },
];
