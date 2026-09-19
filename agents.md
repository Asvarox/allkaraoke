# Agent Instructions

- The baseline branch is called `master` (not `main`, not `trunk` etc)
- This project uses React Compiler and thus callbacks and values don't need to be manually memoized

## Commands

### Type checking

When asked to verify types or check for type errors, run:

```bash
pnpm type-check
```

### Unused files

When asked to find or remove unused files, run:

```bash
pnpm knip
```

### Tests

- `pnpm test` - unit tests (`*.test.ts(x)`, happy-dom)
- `pnpm test:browser` - tests that need a real browser (`*.browser.test.ts(x)`: canvas drawing, visual regression via `toMatchScreenshot`, mic input), run in Vitest browser mode with Playwright's Chromium. Only the `-ci` screenshot references in `__snapshots__/` are committed - CI renders and commits them

## Styling

- Do not use Material UI or Emotion for new styles or new UI components. Use Tailwind utility classes and existing AKUI primitives instead.

## Comments

Unless explaining a workflow or a process, keep the comments to at most 2 lines
