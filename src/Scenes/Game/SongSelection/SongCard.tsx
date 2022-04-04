import styled from 'styled-components';
import { typography } from '../../../Elements/cssMixins';
import styles from '../Singing/GameOverlay/Drawing/styles';

export const SongCardContainer = styled.div<{ width: number }>`
    font-size: ${(props) => props.width * 0.065}px;

    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;

    box-sizing: border-box;
`;

export const SongCard = styled(SongCardContainer).attrs<{ video: string }>((props) => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
    },
}))<{ video: string }>`
    cursor: pointer;
    background-size: cover;
    background-position: center center;
`;

export const SongListEntryDetails = styled.span`
    background: rgba(0, 0, 0, 0.7);

    width: auto;
    display: inline-block;
    padding: 0.15em;
    ${typography};

    text-align: right;
`;

export const SongListEntryDetailsArtist = styled(SongListEntryDetails)`
    color: ${styles.colors.text.active};
`;

export const SongListEntryDetailsTitle = styled(SongListEntryDetails)`
    margin-top: 0.25em;
    color: white;
`;
