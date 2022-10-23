export default {
    "*.{mjs,ts,tsx}": ["eslint --cache --fix"],
    "*.{ts,tsx}": () => 'tsc --noEmit',
}