import { execSync } from 'node:child_process';

export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'eslint --cache --fix'],
  '*.{ts,tsx}': () => 'tsc --noEmit',
  'public/songs/*.txt': [
    'yarn ts-node scripts/updateLastUpdate.ts',
    'yarn generate-index',
    'git add public/songs/index.json',
  ],
  '__snapshots__/**/*darwin.png': (files) =>
    files.map((file) => {
      if (process.platform === 'darwin') {
        const linuxFileName = file.replace('darwin.png', 'linux.png');

        if (!files.includes(linuxFileName)) {
          execSync(`rm ${linuxFileName} || true`);
          execSync(`cp ${file} ${linuxFileName}`);

          return `git add ${linuxFileName}`;
        }
      }
      return '';
    }),
};
