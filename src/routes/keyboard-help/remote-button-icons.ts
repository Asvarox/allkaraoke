import { ArrowForward, Check, Pause, PlayArrow, Settings, Shuffle } from '@mui/icons-material';
import { ComponentType } from 'react';

/**
 * The glyphs the remote knows how to draw, keyed by the name a host screen sends over the wire (see
 * `RemoteButtonIcon` in `controls.ts`) — used both on the RIGHT of a mirrored button and as the
 * mirrored screen's header icon. This map is the single source of truth: add an icon here and the
 * wire type picks it up automatically, no separate type to keep in sync.
 */
export const remoteButtonIcons = {
  forward: ArrowForward,
  play: PlayArrow,
  pause: Pause,
  confirm: Check,
  shuffle: Shuffle,
  settings: Settings,
} satisfies Record<string, ComponentType>;
