import { Global } from '@emotion/react';
import styles from '../src/styles';
import '../src/index.css';

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
    (Story) => (
        <>
            <Global styles={styles} />
            <Story />
        </>
    ),
];
