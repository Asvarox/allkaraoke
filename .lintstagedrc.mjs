export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'eslint --cache --fix'],
  '*.{ts,tsx}': () => 'tsc --noEmit',
  'public/songs/*.txt': [
    'yarn ts-node scripts/updateLastUpdate.ts',
    'yarn generate-index',
    'yarn ts-node scripts/generateSongStats.ts',
    'git add public/songs/index.json src/Scenes/LandingPage/songStats.json',
  ],
};
