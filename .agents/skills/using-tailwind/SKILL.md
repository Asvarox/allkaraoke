---
name: using-tailwind
description: 'Guidelines for styling UI in this project — when to use TWC (react-twc) vs inline Tailwind classes, and which AKUI primitives to reach for. Use when building or reviewing UI components.'
---

# Tailwind & Component Styling

## TWC (react-twc) usage

Use `twc` only when the component:

- Will be **used multiple times** (appears at 2+ call sites in the codebase), **and/or**
- Has **complex conditional classes** (multiple ifs in `className`)

Otherwise **inline** the element with a plain `className`.

```tsx
// ✅ TWC — appears at multiple call sites
const DateHeader = twc(Typography)`mt-6 mb-2 text-lg font-semibold opacity-70`;

// ✅ TWC — conditional classes via callback
const Card = twc.div((props: { 'data-focused'?: boolean }) => [
  'cursor-pointer rounded-lg px-6 py-4 transition-transform',
  props['data-focused'] && 'bg-active scale-[1.025]',
]);

// ✅ Inline — one-off wrapper, no conditionals
<div className="flex h-full flex-col gap-2 overflow-y-auto p-8">

// ✅ Inline with Typography — one-off heading
<Typography as="h1" className="mb-4 text-3xl font-bold">History</Typography>
```

## AKUI Primitives

Prefer components from `src/modules/elements/AKUI/` over raw HTML + classes:

- **`Typography`** (`~/modules/elements/AKUI/Primitives/Typography`) — for any text. Accepts `as` for element type (`h1`, `h2`, `p`, `div`…). Adds the `typography` CSS class automatically. Supports `active` prop for accent colour.
- **`Box`** (`~/modules/elements/AKUI/Primitives/Box`) — polymorphic container with `flex flex-col items-center justify-center rounded-md bg-black/50`. Override with `className`. Not suitable where those defaults are unwanted.
- **`Menu` / `Menu.Button` / `Menu.Header`** — for menu screens (main menu, settings).
- Use `twc(Typography)` or `twc(Box)` to create reusable AKUI-based TWC variants.
