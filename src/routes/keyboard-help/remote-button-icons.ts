import { IconName } from '~/modules/elements/akui/icon';

/**
 * The glyphs the remote knows how to draw, keyed by the name a host screen sends over the wire (see
 * `RemoteButtonIcon` in `controls.ts`) — used both on the RIGHT of a mirrored button and as the
 * mirrored screen's header icon. This map is the single source of truth: add an icon here and the
 * wire type picks it up automatically, no separate type to keep in sync.
 */
export const remoteButtonIcons = {
  forward: 'ic:baseline-arrow-forward',
  play: 'ic:baseline-play-arrow',
  pause: 'ic:baseline-pause',
  fastForward: 'ic:baseline-fast-forward',
  confirm: 'ic:baseline-check',
  shuffle: 'ic:baseline-shuffle',
  settings: 'ic:baseline-settings',
} satisfies Record<string, IconName>;
