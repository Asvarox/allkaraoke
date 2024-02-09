import PlayersManager from 'Players/PlayersManager';
import PostGameView from 'Scenes/Game/Singing/PostGame/PostGameView';
import useHighScores from 'Scenes/Game/Singing/PostGame/hooks/useHighScores';
import LayoutGame from 'Scenes/LayoutGame';
import { SingSetup, Song } from 'interfaces';
import { useMemo } from 'react';
import GameState from '../GameState/GameState';

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
