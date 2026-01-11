import clsx from 'clsx';
import { ComponentProps, memo } from 'react';
import { PlayerMicCheck } from '~/modules/Elements/VolumeIndicator';
import GameState from '~/modules/GameEngine/GameState/GameState';
import usePlayerMicStatus from '~/modules/hooks/players/usePlayerMicStatus';
import PlayersManager, { PlayerEntity } from '~/modules/Players/PlayersManager';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/Settings/SettingsState';
import PlayerStatus from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck/Status';

export default function LyricsVolumeIndicators({
  player,
  effectsEnabled,
  showStatusForAllPlayers,
}: {
  player: PlayerEntity;
  effectsEnabled: boolean;
  showStatusForAllPlayers: boolean;
}) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  if (mobilePhoneMode || !effectsEnabled) return null;

  return (
    <div className="absolute inset-y-0 right-0 flex h-full flex-col items-center justify-center">
      {showStatusForAllPlayers ? (
        GameState.getPlayers().map((p) => (
          <VolumeIndicator key={p.getNumber()} className="flex-1" player={PlayersManager.getPlayer(p.getNumber())!} />
        ))
      ) : (
        <VolumeIndicator className="flex-1" player={player} />
      )}
    </div>
  );
}

interface Props extends ComponentProps<'div'> {
  player: PlayerEntity;
}

const VolumeIndicator = memo(({ player, ...props }: Props) => {
  const status = usePlayerMicStatus(player.number);
  const { className, ...restProps } = props;

  return (
    <div {...restProps} className={clsx('relative flex w-52 items-end', className)}>
      {status !== 'unavailable' && <PlayerMicCheck playerNumber={player.number} />}
      <PlayerStatus playerNumber={player.number} tooltipPosition="start" className="z-10" />
    </div>
  );
});
