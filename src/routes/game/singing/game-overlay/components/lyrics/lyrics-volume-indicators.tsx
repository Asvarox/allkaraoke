import clsx from 'clsx';
import { ComponentProps, memo } from 'react';
import { PlayerMicCheck } from '~/modules/elements/volume-indicator';
import GameState from '~/modules/game-engine/game-state/game-state';
import usePlayerMicStatus from '~/modules/hooks/players/use-player-mic-status';
import PlayersManager, { PlayerEntity } from '~/modules/players/players-manager';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';
import PlayerStatus from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/status';

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
