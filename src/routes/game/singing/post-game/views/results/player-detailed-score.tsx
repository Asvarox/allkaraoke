import { DetailedScore } from '~/interfaces';
import { ProgressBar } from '~/modules/elements/akui/progress-bar';
import styles from '~/modules/game-engine/drawing/styles';
import { PlayerNumber } from '~/modules/players/player-number';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';

interface Props {
  playerNumber: PlayerNumber;
  player: PlayerScore;
  /** Score reached so far in the reveal. Each bar shows that as a share of what the whole song was
   * worth, so the bars fill as the song plays back rather than one note type at a time. */
  revealed: DetailedScore;
  /** Only the row currently on top shows what each bar is and its percentage. */
  showLabels: boolean;
}

function PlayerDetailedScore({ playerNumber, player, revealed, showLabels }: Props) {
  const maxScore = player.detailedScore[1];
  const playerColors = styles.colors.players[playerNumber];

  /** A bar is empty rather than full when the song had none of that note type to sing. */
  const share = (scored: number, max: number) => (max > 0 ? scored / max : 0);

  const bars = [
    {
      label: 'Regular',
      progress: share(
        revealed.rap + revealed.freestyle + revealed.normal,
        maxScore.rap + maxScore.freestyle + maxScore.normal,
      ),
      color: playerColors.perfect.fill,
    },
    { label: 'Perfect', progress: share(revealed.perfect, maxScore.perfect), color: playerColors.stroke },
    { label: 'Star', progress: share(revealed.star, maxScore.star), color: playerColors.starPerfect.stroke },
    { label: 'Vibrato', progress: share(revealed.vibrato, maxScore.vibrato), color: playerColors.perfect.stroke },
  ];

  return (
    <div className="flex w-full flex-row gap-2 px-1 py-1 2xl:gap-3">
      {bars.map((bar) => (
        <ProgressBar
          key={bar.label}
          className="flex-1"
          progress={bar.progress}
          color={bar.color}
          label={showLabels ? bar.label : undefined}
        />
      ))}
    </div>
  );
}

export default PlayerDetailedScore;
