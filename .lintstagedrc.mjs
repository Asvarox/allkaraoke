export default {
  '*.{mjs,ts,tsx}': ['oxfmt --config ./.oxfmtrc.ci.js', 'oxlint --fix-dangerously'],
  '*.{ts,tsx}': () => 'bun run type-check',
  '{src,functions}/**/*.{ts,tsx}': () => 'bun run test:staged',
  '{package.json,knip.json,{src,functions,tests,scripts}/**/*.{ts,tsx,js,mjs}}': () => 'bun run knip',
};
