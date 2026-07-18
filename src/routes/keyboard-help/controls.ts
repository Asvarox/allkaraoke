/**
 * Control descriptors for the "mirrored" remote-mic keyboard.
 *
 * A screen that opts into mirroring (via the `Nav.*` wrappers) describes each of its
 * navigable controls with one of these descriptors. The descriptor is derived from the
 * same props that render the on-screen control, so the phone and the screen cannot drift
 * (single source of truth) — the one exception is `label`, which a screen may override
 * with a shorter `remoteLabel` since the phone has much less horizontal room than a menu.
 *
 * The `type` discriminant is exhaustively handled on the phone via `assertNever`, so adding
 * a new control type here without a matching remote renderer fails the TypeScript build.
 */

/** Fields injected by `useKeyboardNav` (not provided by the screen author). */
interface ControlMeta {
  name: string;
  disabled?: boolean;
}

/** Marks a button's semantic role so the remote can add a visual cue (e.g. a leading back arrow). */
export type ButtonVariant = 'back';

export type ControlDescriptor =
  | (ControlMeta & { type: 'button'; label: string; variant?: ButtonVariant })
  | (ControlMeta & { type: 'switch'; label: string; value: string })
  | (ControlMeta & { type: 'checkbox'; label: string; checked: boolean });

export type ControlType = ControlDescriptor['type'];

/**
 * What a screen author passes (via the `Nav.*` wrappers). The `name`/`focused`/`disabled`
 * meta fields are added by `useKeyboardNav.register`.
 */
export type ControlInput =
  | { type: 'button'; label: string; variant?: ButtonVariant }
  | { type: 'switch'; label: string; value: string }
  | { type: 'checkbox'; label: string; checked: boolean };

/** Exhaustiveness guard — a compile error here means a control type is unhandled. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled control descriptor: ${JSON.stringify(value)}`);
}

/** Runtime sanity check for a single descriptor (defense in depth for the wire payload). */
export function isValidControl(control: ControlDescriptor): boolean {
  if (!control || typeof control.name !== 'string' || !control.name) return false;
  if (typeof control.label !== 'string') return false;
  switch (control.type) {
    case 'button':
      return true;
    case 'switch':
      return typeof control.value === 'string';
    case 'checkbox':
      return typeof control.checked === 'boolean';
    default:
      return false;
  }
}
