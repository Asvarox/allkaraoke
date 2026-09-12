import { ComponentProps, ReactNode } from 'react';

import Box from '~/modules/elements/akui/primitives/box';
import { VolumeIndicator as VolumeBar } from '~/modules/elements/volume-indicator';
import { PlayerNumber } from '~/modules/players/player-number';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import PlayerChange from '~/routes/remote-mic/panels/microphone/player-change';

/** Matches the throttle `MicPreview` samples the mic at, so the bar tweens between levels instead of
 * stepping to each new one. */
const SAMPLE_INTERVAL_MS = 150;

interface ShellProps extends Omit<ComponentProps<typeof Box>, 'children' | 'volume'> {
  playerNumber: PlayerNumber | null;
  volume: number;
  isMicOn: boolean;
  /** The control that sits inside the pill — in the app, the button that picks a colour. */
  action?: ReactNode;
}

/**
 * This phone's own mic level, as the same pill the host shows for every singer: a player-coloured
 * gradient filling in behind the control, so someone looking at their phone and someone looking at
 * the TV are reading the same thing.
 *
 * Before joining there is no player colour to fill with, so the pill stays grey and empty — the only
 * thing to do with it then is press the button inside it and pick one.
 *
 * Split from the wired component below so it can be rendered without the network client behind it.
 */
export function MicPillShell({ playerNumber, volume, isMicOn, action, className, ...props }: ShellProps) {
  const joined = playerNumber !== null;

  return (
    <Box
      {...props}
      className={`relative h-14 w-full flex-row! items-center overflow-hidden border px-2 py-2 text-lg transition-colors ${
        joined ? 'text-default border-white' : 'border-gray-600 text-gray-500'
      } ${className ?? ''}`}
      data-is-mic-on={isMicOn}
      data-player-number={`${playerNumber ?? 'none'}`}
      data-test="indicator">
      {/* Only while the mic is live: a bar frozen at whatever level it last saw would read as sound
          still coming in. */}
      {joined && isMicOn && (
        <VolumeBar
          playerNumber={playerNumber}
          volume={volume}
          transitionMs={SAMPLE_INTERVAL_MS}
          className="z-0 rounded-xl"
        />
      )}
      {action}
    </Box>
  );
}

interface Props {
  volume: number;
  playerNumber: PlayerNumber | null;
  isMicOn: boolean;
  isConnected: boolean;
  className?: string;
}

export default function VolumeIndicator({ playerNumber, volume, isMicOn, isConnected, className = '' }: Props) {
  const permissions = usePermissions();

  return (
    <MicPillShell
      playerNumber={playerNumber}
      volume={volume}
      isMicOn={isMicOn}
      action={
        isConnected && permissions === 'write' && <PlayerChange className="z-1 ml-auto" playerNumber={playerNumber} />
      }
      className={className}
    />
  );
}
