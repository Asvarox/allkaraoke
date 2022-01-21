import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../Elements/Button';
import { focusable } from '../../../Elements/cssMixins';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { DetailedScore, PlayerNote, Song } from '../../../interfaces';
import SongPage, { ContentElement } from '../SongPage';
import styles from './Drawing/styles';
import { calculateDetailedScoreData, MAX_POINTS, sumDetailedScore } from './Helpers/calculateScore';
import ScoreText from './ScoreText';

interface Props {
    width: number;
    height: number;
    song: Song;
    playerNotes: [PlayerNote[], PlayerNote[]];
    tracksForPlayers: [number, number];
    onClickSongSelection: () => void;
}

const MAX_TICKS = 100;

const POINTS_PER_TICK = MAX_POINTS / MAX_TICKS;

function PostGame({ song, playerNotes, width, height, onClickSongSelection, tracksForPlayers }: Props) {
    const [currentTick, setCurrentTick] = useState(0);
    useKeyboardNav({
        onEnter: onClickSongSelection,
    });

    useEffect(() => {
        if (currentTick >= MAX_TICKS) return;
        const timeout = setTimeout(() => setCurrentTick((tick) => tick + 1), 16);

        return () => clearTimeout(timeout);
    }, [currentTick]);

    const playerScores = useMemo(
        () => playerNotes.map((notes, index) => calculateDetailedScoreData(notes, song, tracksForPlayers[index])),
        [playerNotes, song, tracksForPlayers],
    );

    const getPlayerScoreText = ([pointsPerBeat, counts]: [number, DetailedScore, DetailedScore]) =>
        Math.min(sumDetailedScore(counts) * pointsPerBeat, POINTS_PER_TICK * currentTick);

    const player1sum = getPlayerScoreText(playerScores[0]);
    const player2sum = getPlayerScoreText(playerScores[1]);

    return (
        <SongPage songData={song} width={width} height={height}>
            <ScoresContainer>
                <ScoreTextPlayer>Player #1</ScoreTextPlayer>
                <br />
                <ScoreTextScore win={currentTick === MAX_TICKS && player1sum > player2sum}>
                    <ScoreText score={player1sum} />
                </ScoreTextScore>
                <br /> {/* xD */}
                <br />
                <br />
                <br />
                <ScoreTextScore win={currentTick === MAX_TICKS && player2sum > player1sum}>
                    <ScoreText score={player2sum} />
                </ScoreTextScore>
                <br />
                <ScoreTextPlayer>Player #2</ScoreTextPlayer>
            </ScoresContainer>
            <SongSelectionButton onClick={onClickSongSelection} focused>
                Select song
            </SongSelectionButton>
        </SongPage>
    );
}

const ScoresContainer = styled.div`
    position: absolute;
    top: 200px;
    width: 100%;
    text-align: center;
`;

const ScoreTextPlayer = styled(ContentElement)`
    padding-left: 100px;
    padding-right: 100px;
    font-size: 35px;
`;

const ScoreTextScore = styled(ScoreTextPlayer)<{ win: boolean }>`
    font-size: ${(props) => (props.win ? '105px' : '55px')};
    color: ${styles.colors.text.active};
    transition: 400ms ease-in-out;
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
    position: absolute;
    bottom: 40px;
    right: 20px;
    width: 400px;

    ${focusable}
`;

export default PostGame;
