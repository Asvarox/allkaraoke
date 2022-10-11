import { Song } from 'interfaces';
import { useMemo } from 'react';
import PostGameView from 'Scenes/Game/Singing/PostGame/PostGameView';
import GameState from '../GameState/GameState';
import { calculateDetailedScoreData } from '../GameState/Helpers/calculateScore';

interface Props {
    width: number;
    height: number;
    song: Song;
    onClickSongSelection: () => void;
}

function PostGame({ song, width, height, onClickSongSelection }: Props) {
    const playerScores = useMemo(
        () =>
            GameState.getPlayers().map((player, index) => ({
                name: `Player #${index}`,
                detailedScore: calculateDetailedScoreData(player.getPlayerNotes(), song, player.getTrackIndex()),
            })),
        [song],
    );

    return (
        <PostGameView
            song={song}
            width={width}
            height={height}
            onClickSongSelection={onClickSongSelection}
            players={playerScores}
        />
    );
}

export default PostGame;
