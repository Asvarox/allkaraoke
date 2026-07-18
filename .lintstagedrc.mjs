export default {
  '*.{mjs,ts,tsx}': ['oxfmt --config ./.oxfmtrc.ci.js', 'oxlint --fix-dangerously'],
  '*.{ts,tsx}': () => 'pnpm type-check',
  '{src,functions}/**/*.{ts,tsx}': () => 'pnpm test:staged',
  '{package.json,knip.json,{src,functions,tests,scripts}/**/*.{ts,tsx,js,mjs}}': () => 'pnpm knip',
};
