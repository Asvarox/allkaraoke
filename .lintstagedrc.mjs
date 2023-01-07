export default {
    "*.{mjs,ts,tsx}": ["eslint --cache --fix"],
    "*.{ts,tsx}": () => 'tsc --noEmit',
    "public/songs/*.json": ["yarn generate-index", "git add public/songs/index.json"],
}
