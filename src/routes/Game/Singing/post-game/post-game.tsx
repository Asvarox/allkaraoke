import { useMemo } from 'react';
import { SingSetup, Song } from '~/interfaces';
import PlayersManager from '~/modules/players/players-manager';
import useHighScores from '~/routes/game/singing/post-game/hooks/use-high-scores';
import PostGameView from '~/routes/game/singing/post-game/post-game-view';
import LayoutGame from '~/routes/layout-game';
import { UnassignOnSongFinishedSetting } from '~/routes/settings/settings-state';
import GameState from '../../../../modules/game-engine/game-state/game-state';

interface Props {
  width: number;
  height: number;
  song: Song;
  onClickSongSelection: () => void;
  singSetup: SingSetup;
}

function PostGame({ song, width, height, onClickSongSelection, singSetup }: Props) {
  const highScores = useHighScores(song, singSetup);
  const playerScores = useMemo(
    () =>
      PlayersManager.getPlayers().map((player) => ({
        name: player.getName(),
        playerNumber: player.number,
        detailedScore: GameState.getPlayerDetailedScore(player.number),
      })),
    [],
  );

  return (
    <LayoutGame>
      <PostGameView
        singSetup={singSetup}
        song={song}
        width={width}
        height={height}
        onClickSongSelection={() => {
          onClickSongSelection();

          if (UnassignOnSongFinishedSetting.get()) {
            PlayersManager.getPlayers().forEach((player) => {
              if (player.input.source === 'Remote Microphone') {
                PlayersManager.removePlayer(player.number);
              }
            });
          }
        }}
        players={playerScores}
        highScores={highScores}
      />
    </LayoutGame>
  );
}

export default PostGame;
