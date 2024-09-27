export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'eslint --cache --fix'],
  '*.{ts,tsx}': () => 'pnpm tsc --noEmit',
  'src/**/*.{ts,tsx}': () => ['pnpm run test --watch=false', 'pnpm unimported --no-cache'],
};
