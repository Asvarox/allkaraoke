export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'eslint --cache --fix'],
  '*.{ts,tsx}': () => 'pnpm tsc --noEmit',
  'src/**/*.{ts,tsx}': () => ['pnpm run test --watch=false', 'pnpm unimported --no-cache'],
  'public/songs/*.txt': [
    'pnpm ts-node scripts/updateLastUpdate.ts',
    'pnpm generate-index',
    'pnpm ts-node scripts/generateSongStats.ts',
    'git add public/songs/index.json src/routes/LandingPage/songStats.json',
  ],
};
