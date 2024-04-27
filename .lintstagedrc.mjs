export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'eslint --cache --fix'],
  '*.{ts,tsx}': () => 'pnpm tsc --noEmit',
  'public/songs/*.txt': [
    'pnpm ts-node scripts/updateLastUpdate.ts',
    'pnpm generate-index',
    'pnpm ts-node scripts/generateSongStats.ts',
    'git add public/songs/index.json src/Scenes/LandingPage/songStats.json',
  ],
};
