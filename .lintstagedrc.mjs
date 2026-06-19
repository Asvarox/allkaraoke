export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'oxlint --fix'],
  '*.{ts,tsx}': () => 'pnpm type-check',
  '{src,functions}/**/*.{ts,tsx}': () => ['pnpm run test --watch=false --changed --passWithNoTests', 'pnpm knip'],
};
