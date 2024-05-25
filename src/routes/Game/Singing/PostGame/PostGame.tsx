import { SingSetup, Song } from 'interfaces';
import PlayersManager from 'modules/Players/PlayersManager';
import { useMemo } from 'react';
import PostGameView from 'routes/Game/Singing/PostGame/PostGameView';
import useHighScores from 'routes/Game/Singing/PostGame/hooks/useHighScores';
import LayoutGame from 'routes/LayoutGame';
import GameState from '../../../../modules/GameEngine/GameState/GameState';

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
        onClickSongSelection={onClickSongSelection}
        players={playerScores}
        highScores={highScores}
      />
    </LayoutGame>
  );
}

export default PostGame;
