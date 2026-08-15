## Using AKUI

AKUI is a small, dark-themed component kit for a karaoke app. It has no top-level provider — every component renders standalone, no wrapper needed:

```tsx
import { Button, Chip, Icon, Selector } from 'akui';

<Button leftIcon={<Icon icon="ic:baseline-search" />} size="regular">
  Search
</Button>
```

### Styling idiom

Components are styled with **Tailwind v4 utility classes** (CSS-first config, `@import 'tailwindcss'`), not a prop-based theme API. Compose new UI the same way — plain utility classes, not inline styles or a CSS-in-JS API.

Real vocabulary from this codebase (grep `components/` and `_ds_bundle.css` for the full set):
- `typography` — base text color/utility (custom `@utility` in the source stylesheet)
- `bg-active` / `text-active` — the brand accent color (orange), used for focused/selected states
- `subtle-focus` — a subtle inset focus ring utility
- `stroke-text` — thin text outline utility
- `shadow-focusable` — focus-affordance shadow
- Standard Tailwind sizing/spacing/layout utilities (`flex`, `gap-2`, `px-3`, `h-20`, `rounded-*`, etc.)

The whole UI is dark by default (`bg-slate-950`-class backgrounds, light text) — don't default to a light theme when composing new screens with these components.

### Where the truth lives

Read `styles.css` and its `@import` closure (`_ds_bundle.css`) before styling anything new — it carries every real utility/token this DS ships. Per-component `.prompt.md` files carry usage notes; `<Name>.d.ts` is the prop contract.

### Example composition

```tsx
import { Chip, Icon, Menu } from 'akui';

<Menu title="Playlist">
  <Menu.Header>Up next</Menu.Header>
  <Chip variant="green">Live</Chip>
  <Icon icon="ic:baseline-check" />
</Menu>
```
