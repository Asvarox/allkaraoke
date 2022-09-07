import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import analyze from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    [
                        'babel-plugin-styled-components',
                        {
                            displayName: true,
                            fileName: false,
                        },
                    ],
                ],
            },
        }),
        tsconfigPaths(),
        analyze(),
        basicSsl(),
    ],
    base: './',
    build: {
        outDir: 'build',
        sourcemap: true,
    },
    server: {
        port: 3000,
        open: 'https://localhost:3000',
    },
});
