import { PlayerNote, Song } from '../../../interfaces';
import SongPage, { ContentElement } from '../SongPage';
import styled from 'styled-components';
import { Button } from '../../../Elements/Button';
import styles from './Drawing/styles';
import calculateScore from './Helpers/calculateScore';
import ScoreText from './ScoreText';

interface Props {
    width: number;
    height: number;
    song: Song;
    playerNotes: [PlayerNote[], PlayerNote[]];
    onClickSongSelection: () => void;
}

function PostGame({ song, playerNotes, width, height, onClickSongSelection }: Props) {
    return (
        <SongPage songData={song} width={width} height={height}>
            <ScoresContainer>
                <ScoreTextPlayer>Player #1</ScoreTextPlayer>
                <br />
                <ScoreTextScore><ScoreText score={calculateScore(playerNotes[0], song)} /></ScoreTextScore>
                <br /> {/* xD */}
                <br />
                <br />
                <br />
                <ScoreTextScore><ScoreText score={calculateScore(playerNotes[1], song)} /></ScoreTextScore>
                <br />
                <ScoreTextPlayer>Player #2</ScoreTextPlayer>
            </ScoresContainer>
            <SongSelectionButton onClick={onClickSongSelection}>Select song</SongSelectionButton>
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

const SongSelectionButton = styled(Button)`
    position: absolute;
    bottom: 40px;
    right: 20px;
    width: 400px;
`;

export default PostGame;
