/**
 * The button surface, restated for the remote-mic's "selector"-style controls — the switcher, the
 * checkbox and the numeric stepper. Anything interactive carries the same, more prominent fill as a
 * button, so a stepper sitting in a row of buttons reads as the same kind of thing rather than as a
 * slightly different one.
 *
 * The stepper is a plain element, not a `Button`, so it would otherwise fall through to the panel's
 * own surface; `important` keeps it from being reset by a caller's layout classes.
 *
 * `disabled:bg-gray-500!` re-asserts the base button's disabled colour, which the fill above would
 * otherwise wash out. It's inert on non-button elements (a `div` is never `:disabled`).
 */
export const remoteSelectorBackground = 'bg-black/55! disabled:bg-gray-500!';

/**
 * Height of a remote-mic control, matching AKUI's `size="small"` button (`h-14`, `mobile:h-12`) that
 * every mirrored button/switcher/checkbox renders at — so a stepper sitting among them lines up.
 */
export const remoteControlHeight = 'mobile:h-12 h-14';
