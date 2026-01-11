import { PlayerMicCheck } from '~/modules/Elements/VolumeIndicator';
import usePlayerMicStatus from '~/modules/hooks/players/usePlayerMicStatus';
import { PlayerEntity } from '~/modules/Players/PlayersManager';
import PlayerStatus from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck/Status';

interface Props {
  player: PlayerEntity;
}
export default function SinglePlayer({ player }: Props) {
  const status = usePlayerMicStatus(player.number);
  return (
    <div
      key={player.number}
      data-test={`indicator-player-${player.number}`}
      className="relative flex h-16 w-120 items-center gap-5 border border-white bg-black px-2 py-2 text-center text-xl text-white">
      <span className="ph-no-capture absolute inset-0 z-[1] flex items-center justify-center">{player.getName()}</span>
      <PlayerStatus playerNumber={player.number} className="z-1" />
      {status !== 'unavailable' && <PlayerMicCheck playerNumber={player.number} className="z-0" />}
    </div>
  );
}
