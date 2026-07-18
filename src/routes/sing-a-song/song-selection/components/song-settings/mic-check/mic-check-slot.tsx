import Box from '~/modules/elements/akui/primitives/box';
import { PlayerMicCheck } from '~/modules/elements/volume-indicator';
import usePlayerMicStatus from '~/modules/hooks/players/use-player-mic-status';
import { PlayerEntity } from '~/modules/players/players-manager';

import PlayerStatus from './status';

interface Props {
  playerIndex: 0 | 1 | 2 | 3;
  player: PlayerEntity | undefined;
}

export default function MicCheckSlot({ playerIndex, player }: Props) {
  const status = usePlayerMicStatus(playerIndex);
  const isConnected = player !== undefined && player.input.source !== 'Dummy';

  return (
    <Box
      data-test={`indicator-player-${playerIndex}`}
      className={`relative flex h-14 w-full items-center gap-5 border px-2 py-2 text-center text-lg transition-opacity ${
        isConnected ? 'border-white text-white' : 'border-gray-600 bg-black text-gray-500 opacity-40'
      }`}>
      <span className="ph-no-capture absolute inset-0 z-1 flex items-center justify-center">
        {player?.getName() ?? `Player ${playerIndex + 1}`}
      </span>
      {isConnected && (
        <>
          <PlayerStatus playerNumber={playerIndex} className="z-1" />
          {status !== 'unavailable' && <PlayerMicCheck playerNumber={playerIndex} className="z-0 rounded-xl" />}
        </>
      )}
    </Box>
  );
}
