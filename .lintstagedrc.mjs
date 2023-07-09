import { execSync } from 'node:child_process';

export default {
    '*.{mjs,ts,tsx}': ['eslint --cache --fix'],
    '*.{ts,tsx}': () => 'tsc --noEmit',
    'public/songs/*.json': ['yarn generate-index', 'git add public/songs/index.json'],
    '__snapshots__/**/*darwin.png': (files) =>
        files.map((file) => {
            if (process.platform === 'darwin') {
                const linuxFileName = file.replace('darwin.png', 'linux.png');

                if (!files.includes(linuxFileName)) {
                    execSync(`rm ${linuxFileName}`);
                    execSync(`cp ${file} ${linuxFileName}`);

                    return `git add ${linuxFileName}`;
                }
            }
            return '';
        }),
};
