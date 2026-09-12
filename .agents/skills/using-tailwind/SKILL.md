---
name: using-tailwind
description: 'The design language for this project and how to style UI with it — the colour, type, surface and layer tokens, when to reach for an AKUI component instead of writing classes, and when TWC (react-twc) is warranted over inline Tailwind. Use when building or reviewing any UI.'
---

# Design Language & Styling

## The rule that matters most

**Reach for an existing AKUI component first, a token second, and a new value never — until you have
added it to the system.**

Almost every visual decision in this app has already been made and named. A screen that picks its
own grey, its own opacity or its own z-index is not expressing something the system couldn't; it is
adding a value nobody else can find. The system got into a bad state exactly that way — sixteen
different card backgrounds, twenty-two z-index values, six ways to say "error" — and digging out of
it is why these tokens exist.

If nothing fits, that is a signal to extend the system, not to work around it. Add the token or the
variant, document it in Storybook, and use it. Keep genuine exceptions rare and comment why.

Everything below is documented live under **Foundations** in Storybook, where each page reads its
values back out of the DOM. When in doubt, look there rather than guessing from this file.

## Components before classes

Prefer `src/modules/elements/akui/` over raw HTML plus classes:

- **`Typography`** (`primitives/typography`) — any text. `as` sets the element (`h1`, `p`, `div`…),
  `active` sets the accent colour. Applies the `typography` utility, so text takes `text-default`
  and nested `<strong>` takes `text-active`.
- **`Box`** (`primitives/box`) — the default card surface: `flex flex-col items-center
  justify-center rounded-xl bg-black/40` plus an inset shadow. Override via `className`; reach past
  it only when those defaults are actively wrong.
- **`Button` / `Menu` / `Menu.Button` / `Menu.Header`** — every control and menu screen.
- **`Chip`, `Badge`, `Tag`, `Kbd`, `Select`, `Selector`, `Checkbox`, `Skeleton`, `BottomSheet`,
  `Modal`, `Backdrop`** — check for one of these before building the same thing again.
- Compose with `twc(Typography)` / `twc(Box)` rather than reimplementing them.

A raw `<button>` is almost always wrong: it gets none of the interactive affordances below.

## Colour

Semantic tokens only — never a raw Tailwind palette shade for these jobs.

| token | meaning |
| --- | --- |
| `text-default` | body text. What `typography` applies |
| `text-active` | **focus**, headings, emphasis. Orange |
| `text-inactive` | present but not current — the lyric line not being sung |
| `danger` / `warning` / `success` / `info` | the four status roles |

`warning` is amber, not orange, because orange already means *focused*. Don't reintroduce an orange
warning.

Status appears as `text-*`, `bg-*`, `border-*` and `fill-*`. For a panel, use `statusSurface[role]`
from `akui/surfaces` — fill and border, deliberately no text colour, so body copy inside stays
readable.

Player and seasonal colours come from `game-engine/drawing/styles.ts`, which the Tailwind config
reads at build time. Canvas and DOM are painted from that one source; don't fork it.

## Type

Ten steps: `xs sm md lg xl 2xl 3xl 4xl 5xl 6xl`. There is **no `text-base`** — `sm` is 16px and
`md` (20px) is the default body size, which is what `Typography` applies.

Headings have no bare-element sizes; an `<h2>` is body-sized until you give it a `text-*` class.
Use `Menu.Header` for a real menu heading. Pick the element for document structure and the size with
a class.

`font-sans` and `font-mono` are the project's stacks — safe to use, unlike before when `font-sans`
emitted Tailwind's default.

## Surfaces

Translucent black for in-game surfaces (they sit *in* the scene, over the song video); opaque slate
for dialogs (they sit *on top of* it and must stay readable).

- `Box` → `bg-black/40`, the default card
- `bg-black/55` → one step up: interactive things, tooltips, a picked-out row
- `bg-black/75` → bars and toolbars
- `dialogSurface` → modal `Menu`, `Select` popup, bottom sheet, lobby card
- `Backdrop` → the scrim behind anything that opens on top

Borders are white at low alpha: `border-white/10` is every resting edge and `border-white/20` is
that same edge on hover — a pair, not two weights.

## Interactive state

From `akui/surfaces`, and `ButtonBase` is the reference implementation:

- `interactiveSurface` — resting. Fill plus the 1px orange hairline that says a thing can be
  pressed. **Anything interactive should carry it, and anything carrying it should be interactive.**
- `interactiveFocus` — the quiet inset ring, for hover and for focus on a control too big to flood
- `bg-active` — full keyboard focus, which is what a TV needs from across a room
- `inactiveSurface` — switched off but still operable. Not the same as `disabled`, and must not look
  like it

## Layers

Anything `fixed` or portalled takes a rung from the `zIndex` ladder in `tailwind.config.js` —
`z-scene`, `z-hud`, `z-chrome`, `z-modal`, `z-toast` and so on. Never pick a number.

Stacking *inside* a component is different: it forms its own context and competes only with
siblings, so plain `z-1`, `z-2`, `z-10` are correct there. Keep them small — a local `z-1000` reads
like a global claim and is how this got out of hand.

## Responsive

Tailwind's own breakpoints only. `sm:` upward for min-width, `max-*` where a rule has to stop
applying, stacked when a case needs both (`max-lg:landscape:`). The custom `mobile:` and `landscap:`
variants are gone — do not reintroduce them.

Watch the direction: mixing min-width and max-width in one class list leaves a band of widths where
it isn't obvious which rule wins.

## Class composition

Compose with `cn` (or `twx`, which uses it) — never a template string. `cn` is configured to
understand this project's custom utilities, so a caller's class actually overrides the base instead
of both surviving and letting the cascade decide. `` className={`${base} ${className}`} `` also
renders a literal `undefined` when no className is passed.

## TWC (react-twc)

Use `twx` when the component is **used at 2+ call sites** and/or has **complex conditional classes**.
Otherwise inline a plain `className`.

```tsx
// ✅ TWC — multiple call sites
const DateHeader = twx(Typography)`mt-6 mb-2 text-lg font-semibold opacity-70`;

// ✅ TWC — conditional classes via callback
const Card = twx.div((props: { 'data-focused'?: boolean }) => [
  'cursor-pointer rounded-lg px-6 py-4 transition-transform',
  props['data-focused'] && 'bg-active scale-[1.025]',
]);

// ✅ Inline — one-off wrapper, no conditionals
<div className="flex h-full flex-col gap-2 overflow-y-auto p-8">
```

Import `twx` from `~/utils/twx`, not `twc` from `react-twc` — the bare one doesn't merge.
