import { ComponentProps, ReactNode } from 'react';

import Box from '~/modules/elements/akui/primitives/box';
import { PlayerMicCheck, VolumeIndicator } from '~/modules/elements/volume-indicator';
import usePlayerMicStatus from '~/modules/hooks/players/use-player-mic-status';
import { PlayerNumber } from '~/modules/players/player-number';
import { PlayerEntity } from '~/modules/players/players-manager';

import PlayerStatus from './status';

/**
 * What fills the bar behind the name: the local audio pipeline (read directly, so no re-render per
 * frame), a volume reported by a remote singer, or nothing at all for a dropped device.
 */
type VolumeSource = { type: 'local' } | { type: 'remote'; volume: number } | { type: 'none' };

interface ShellProps extends Omit<ComponentProps<typeof Box>, 'children'> {
  playerNumber: PlayerNumber;
  name: ReactNode;
  connected: boolean;
  volume: VolumeSource;
  /**
   * `regular` is the full-size row used wherever the singer list is the point of the screen.
   * `compact` is the same row squeezed into a menu that has other things to show too (the online
   * pause menu), where the full height wouldn't leave room for them.
   */
  size?: 'regular' | 'compact';
  /** Trailing badges (mic status, ping, votes, tags) — rendered above the volume bar. */
  children?: ReactNode;
}

const SIZES = {
  regular: 'h-14 gap-5 border px-2 py-2 text-lg',
  compact: 'h-8 gap-2 rounded-md border-0 px-2 py-0.5 text-base',
} as const;

/**
 * The mic-check row: a player-colored volume bar filling in behind a centered name. Shared by the
 * local song-settings mic check, the online lobby's singer panel and the online pause menu so they
 * always read the same; the local usage below is the source of truth for how it looks.
 */
export function MicCheckSlotShell({
  playerNumber,
  name,
  connected,
  volume,
  size = 'regular',
  children,
  className,
  ...props
}: ShellProps) {
  return (
    <Box
      {...props}
      className={`relative flex w-full items-center text-center transition-opacity ${SIZES[size]} ${
        connected ? 'border-white text-white' : 'border-gray-600 bg-black text-gray-500 opacity-40'
      } ${className ?? ''}`}>
      <span className="ph-no-capture absolute inset-0 z-1 flex items-center justify-center">{name}</span>
      {/* Badges stay visible for a dropped singer too — that's when knowing who dropped matters most */}
      {children}
      {connected && (
        <>
          {volume.type === 'local' && <PlayerMicCheck playerNumber={playerNumber} className="z-0 rounded-xl" />}
          {volume.type === 'remote' && (
            <VolumeIndicator playerNumber={playerNumber} volume={volume.volume} className="z-0 rounded-xl" />
          )}
        </>
      )}
    </Box>
  );
}

interface Props {
  playerIndex: PlayerNumber;
  player: PlayerEntity | undefined;
}

export default function MicCheckSlot({ playerIndex, player }: Props) {
  const status = usePlayerMicStatus(playerIndex);
  const isConnected = player !== undefined && player.input.source !== 'Dummy';

  return (
    <MicCheckSlotShell
      data-test={`indicator-player-${playerIndex}`}
      playerNumber={playerIndex}
      name={player?.getName() ?? `Player ${playerIndex + 1}`}
      connected={isConnected}
      // A dropped device has no volume to show, only the status warning
      volume={status === 'unavailable' ? { type: 'none' } : { type: 'local' }}>
      {isConnected && <PlayerStatus playerNumber={playerIndex} className="z-1" />}
    </MicCheckSlotShell>
  );
}
