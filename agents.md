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

## Styling

- Do not use Material UI or Emotion for new styles or new UI components. Use Tailwind utility classes and existing AKUI primitives instead.
