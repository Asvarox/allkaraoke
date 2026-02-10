import { PlayerMicCheck } from '~/modules/Elements/VolumeIndicator';
import PlayersManager from '~/modules/Players/PlayersManager';

interface Props {
  names?: string[];
}

function MicCheck({ names }: Props) {
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
