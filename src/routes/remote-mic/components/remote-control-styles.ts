/**
 * Slightly darker background shared by the remote-mic's "selector"-style controls — the switcher, the
 * checkbox and the numeric stepper — so they read as one family and stand out a touch against the
 * panel. Buttons deliberately keep the standard background: their icon/label layout already reads as
 * a distinct control, so they don't need the extra contrast.
 *
 * `disabled:bg-gray-500!` re-asserts the base button's disabled colour: the darker background is a
 * plain (higher-priority) class that `twMerge` would otherwise let win even for disabled controls,
 * washing out the greyed-out look. It's inert on non-button elements (a `div` is never `:disabled`).
 */
export const remoteSelectorBackground = 'bg-black/65! disabled:bg-gray-500!';

/**
 * Height of a remote-mic control, matching AKUI's `size="small"` button (`h-14`, `mobile:h-12`) that
 * every mirrored button/switcher/checkbox renders at — so a stepper sitting among them lines up.
 */
export const remoteControlHeight = 'mobile:h-12 h-14';
