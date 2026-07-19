import { ArrowForward, Check, PlayArrow, Settings, Shuffle } from '@mui/icons-material';
import { ComponentType } from 'react';

/**
 * The icons the remote can draw on the RIGHT of a mirrored button, keyed by the name a host screen
 * sends in the control descriptor (see `RemoteButtonIcon` in `controls.ts`). This map is the single
 * source of truth: add an icon here and the wire type picks it up automatically, no separate type
 * to keep in sync.
 */
export const remoteButtonIcons = {
  forward: ArrowForward,
  play: PlayArrow,
  confirm: Check,
  shuffle: Shuffle,
  settings: Settings,
} satisfies Record<string, ComponentType>;
