/**
 * The surfaces the app is built from, and the states an interactive one moves through.
 *
 * The surface a dialog-like element is built from: the modal `Menu`, the `Select` popup, the
 * `Autocomplete` menu, the bottom sheet, the lobby card, the expanded song preview.
 *
 * Opaque slate rather than the translucent black the in-game surfaces use. Those sit *in* the scene
 * and let the video through on purpose; a dialog sits on top of it and has to stay readable over
 * whatever happens to be behind it — over a dark backdrop, translucent black simply disappears. The
 * border is what actually reads as the edge once the fill stops contrasting with the scrim.
 *
 * Applied through `cn`/`twx`, so a caller can still override either half.
 */
export const dialogSurface = 'border border-white/10 bg-slate-800';

/**
 * The resting state of anything the player can act on — a button, a switcher, a stepper, a row that
 * responds to a press.
 *
 * Two parts, and both carry meaning. The fill is a step above the card surface underneath, because
 * a control has to read as sitting on top of the thing it belongs to. The 1px orange hairline
 * (`shadow-focusable`, from the Tailwind config) is the actual tell: on a TV across the room, at a
 * glance, it is what separates "you can press this" from "this is just a panel". Anything
 * interactive should carry it, and anything carrying it should be interactive.
 *
 * The `!` matches what `ButtonBase` has always set, so a control that is not a button lands on the
 * same surface as one that is instead of falling through to the panel behind it.
 */
export const interactiveSurface = 'shadow-focusable bg-black/55!';

/**
 * The soft highlight: an inset orange ring, for pointer hover and for keyboard focus that should
 * stay quiet. Distinct from full keyboard focus, which fills the whole control with `bg-active` —
 * this one marks the control without taking over the screen, and is what a big or already-coloured
 * control uses instead.
 */
export const interactiveFocus = 'subtle-focus';

/**
 * Interactive, still operable, but currently switched off — an excluded language, an option that is
 * toggled off rather than unavailable. Struck through and dimmed, so it reads as a live control in
 * an "off" state rather than as a disabled one the player cannot reach.
 *
 * Not the same as `disabled`, which greys the fill out and removes pointer events entirely.
 */
export const inactiveSurface = 'line-through decoration-white opacity-25';

/** The four status roles. `danger` is broken or destructive, `warning` is degraded but working,
 * `success` is confirmed good, `info` is in progress and not yet either. */
export type StatusRole = 'danger' | 'warning' | 'success' | 'info';

/**
 * The surface a status message sits on: a tint of its own colour plus a slightly stronger border.
 *
 * Fill and border only — no text colour. Some callers want the label in the status colour too (a
 * `Chip` does), but a paragraph of body copy inside a warning panel should stay readable body
 * copy, so the two are kept separate and the caller adds `text-danger` and friends when it wants
 * them.
 */
export const statusSurface: Record<StatusRole, string> = {
  danger: 'bg-danger/20 border border-danger/30',
  warning: 'bg-warning/20 border border-warning/30',
  success: 'bg-success/20 border border-success/30',
  info: 'bg-info/20 border border-info/30',
};
