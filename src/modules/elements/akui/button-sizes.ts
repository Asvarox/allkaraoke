export type ButtonSize = 'large' | 'regular' | 'small' | 'mini';

// Icon glyphs are sized off the button's own `size` so every button renders its icons consistently.
// The underlying `<iconify-icon>` element computes its own render size from its `width`/`height`
// attributes and doesn't reliably respond to being stretched via CSS, so it's always given an
// explicit `size` prop (on the same 4px-per-unit scale) rather than sized through a Tailwind class.
export const sizeToIconSize = {
  mini: 5,
  small: 7,
  regular: 8,
  large: 8,
} satisfies Record<ButtonSize, number>;
