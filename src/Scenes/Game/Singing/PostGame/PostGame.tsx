import { HighScoreEntity, SingSetup, Song } from 'interfaces';
import { useMemo } from 'react';
import PostGameView from 'Scenes/Game/Singing/PostGame/PostGameView';
import { useSongStats } from 'Songs/stats/hooks';
import GameState from '../GameState/GameState';
import { calculateDetailedScoreData } from '../GameState/Helpers/calculateScore';
import CameraManager from 'Camera/CameraManager';

interface Props {
    width: number;
    height: number;
    song: Song;
    onClickSongSelection: () => void;
    singSetup: SingSetup;
}

function useHighScores(song: Song, singSetup: SingSetup): HighScoreEntity[] {
    const stats = useSongStats(song);

    const highScores = useMemo(
        () =>
            stats?.scores
                .filter(({ setup }) => setup.mode === singSetup.mode && setup.tolerance === singSetup.tolerance)
                .map((score) =>
                    score.scores.map((singleScore) => ({
                        ...singleScore,
                        date: score.date,
                        singSetupId: score.setup.id,
                    })),
                )
                .flat()
                .sort((a, b) => b.score - a.score)
                .slice(0, 5),
        [stats, singSetup],
    );

    return highScores ?? [];
}

function PostGame({ song, width, height, onClickSongSelection, singSetup }: Props) {
    const highScores = useHighScores(song, singSetup);
    const playerScores = useMemo(
        () =>
            GameState.getPlayers().map((player, index) => ({
                name: player.getName(),
                detailedScore: calculateDetailedScoreData(player.getPlayerNotes(), song, player.getTrackIndex()),
            })),
        [song],
    );
    const photos = useMemo(() => CameraManager.getPhotos(), []);

    return (
        <PostGameView
            singSetupId={singSetup.id}
            song={song}
            width={width}
            height={height}
            onClickSongSelection={onClickSongSelection}
            players={playerScores}
            highScores={highScores}
            photos={photos}
        />
    );
}

export default PostGame;
