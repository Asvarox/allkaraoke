import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import analyze from 'rollup-plugin-visualizer';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: ['@emotion'],
            },
        }),
        tsconfigPaths(),
        analyze(),
        basicSsl(),
        splitVendorChunkPlugin(),
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
