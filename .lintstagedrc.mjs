export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'eslint --cache --fix'],
  '*.{ts,tsx}': () => 'pnpm type-check',
  '{src,functions}/**/*.{ts,tsx}': () => ['pnpm run test --watch=false', 'pnpm knip'],
};
