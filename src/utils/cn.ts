import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom animations. `animation` keys from tailwind.config.js plus the two declared straight as
 * `@utility animate-*` in index.css. Without these, `animate-blink animate-none` keeps both classes
 * and the two animations fight in the cascade.
 */
export const CUSTOM_ANIMATIONS = [
  'blink',
  'calibrate-pulse',
  'gradient',
  'focused',
  'button-focused',
  'logo-pulse',
  'lyrics-pop',
  'lyrics-shake',
  'skeleton',
  'new-song-group-header',
] as const;

/**
 * Utilities that set `box-shadow`: `boxShadow.focusable` from tailwind.config.js and the
 * `subtle-focus` utility from index.css. They belong in the same group as `shadow-*` so the last
 * one wins — `ButtonBase` layers `shadow-focusable` under a conditional `subtle-focus`.
 */
export const CUSTOM_BOX_SHADOWS = ['shadow-focusable', 'subtle-focus'] as const;

/**
 * `typography` (index.css) applies `text-default`, so for merging purposes it *is* a text colour and
 * has to sit in the same group as `text-active` / `text-inactive` / `text-danger`. Otherwise both
 * survive the merge and only the stylesheet's own ordering decides the winner.
 *
 * Consequence worth knowing: `cn('typography', 'text-active')` now resolves to `text-active` alone,
 * dropping typography's nested `strong { text-active }` rule along with its colour. Every element
 * that renders a `<strong>` today applies `typography` *without* an overriding colour, so nothing
 * loses that rule — but reach for a wrapper rather than an override if you need both.
 */
export const TEXT_COLOR_UTILITIES = ['typography'] as const;

/**
 * `stroke-text` sets `-webkit-text-stroke` and has nothing to do with SVG `stroke-*`. Left to the
 * defaults, tailwind-merge reads it as a stroke colour, so `stroke-text stroke-black` silently drops
 * the text stroke (and the reverse order drops the SVG one). Its own group keeps them independent.
 */
export const TEXT_STROKE_UTILITIES = ['stroke-text'] as const;

const twMerge = extendTailwindMerge<'text-stroke'>({
  extend: {
    classGroups: {
      animate: [{ animate: [...CUSTOM_ANIMATIONS] }],
      shadow: [...CUSTOM_BOX_SHADOWS],
      'text-color': [...TEXT_COLOR_UTILITIES],
      'text-stroke': [...TEXT_STROKE_UTILITIES],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
