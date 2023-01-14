import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import analyze from 'rollup-plugin-visualizer';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const fs = require('node:fs');

const certPath = './config/crt/server.pem';
const keyPath = './config/crt/server.key';
const customCert = fs.existsSync(certPath);

if (!customCert) {
    console.log('No custom cert found, Service Worker might not work. Check README.md how to fix it');
}

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
        !customCert && basicSsl(),
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
        ...(customCert && {
            https: {
                // Generated via https://letsencrypt.org/docs/certificates-for-localhost/#making-and-trusting-your-own-certificates
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            },
        }),
    },
});
