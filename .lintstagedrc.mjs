export default {
  '*.{mjs,ts,tsx}': ['prettier --config ./.prettier.config.ci.js --write', 'oxlint --fix'],
  '*.{ts,tsx}': () => 'pnpm type-check',
  '{src,functions}/**/*.{ts,tsx}': () => 'pnpm test:staged',
  '{package.json,knip.json,{src,functions,tests,scripts}/**/*.{ts,tsx,js,mjs}}': () => 'pnpm knip',
};
