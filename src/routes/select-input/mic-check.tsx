import { PlayerMicCheck } from '~/modules/elements/volume-indicator';
import PlayersManager from '~/modules/players/players-manager';

interface Props {
  names?: string[];
}

function MicCheck({ names }: Props) {
  'use no memo'; // React Compiler: PlayersManager.getPlayers() reads a mutable singleton directly in render (not via a hook), so the compiler treats it as non-reactive and caches a stale player list.
  return (
    <div className="flex gap-3">
      {PlayersManager.getPlayers().map((player) => (
        <div
          className="relative flex flex-1 flex-col items-center gap-3 border border-white bg-black px-8 py-2 text-center text-lg text-white"
          data-test={`mic-check-p${player.number}`}
          key={player.number}>
          <PlayerMicCheck playerNumber={player.number} />
          <span className="ph-no-capture">{names?.[player.number] ?? player.getName()}</span>
        </div>
      ))}
    </div>
  );
}

export default MicCheck;
