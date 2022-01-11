import { PlayerNote, Song } from '../../../interfaces';
import SongPage, { ContentElement } from '../SongPage';
import styled from 'styled-components';
import { Button } from '../../../Elements/Button';
import styles from './Drawing/styles';
import calculateScore from './Helpers/calculateScore';
import ScoreText from './ScoreText';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { focusable } from '../../../Elements/cssMixins';

interface Props {
    width: number;
    height: number;
    song: Song;
    playerNotes: [PlayerNote[], PlayerNote[]];
    tracksForPlayers: [number, number],
    onClickSongSelection: () => void;
}

function PostGame({ song, playerNotes, width, height, onClickSongSelection, tracksForPlayers }: Props) {
    useKeyboardNav({
        onEnter: onClickSongSelection,
    })

    return (
        <SongPage songData={song} width={width} height={height}>
            <ScoresContainer>
                <ScoreTextPlayer>Player #1</ScoreTextPlayer>
                <br />
                <ScoreTextScore><ScoreText score={calculateScore(playerNotes[0], song, tracksForPlayers[0])} /></ScoreTextScore>
                <br /> {/* xD */}
                <br />
                <br />
                <br />
                <ScoreTextScore><ScoreText score={calculateScore(playerNotes[1], song, tracksForPlayers[1])} /></ScoreTextScore>
                <br />
                <ScoreTextPlayer>Player #2</ScoreTextPlayer>
            </ScoresContainer>
            <SongSelectionButton onClick={onClickSongSelection} focused>Select song</SongSelectionButton>
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

const ScoreTextScore = styled(ScoreTextPlayer)`
    font-size: 55px;
    color: ${styles.colors.text.active};
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
    position: absolute;
    bottom: 40px;
    right: 20px;
    width: 400px;

    ${focusable}
`;

export default PostGame;
