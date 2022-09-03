import { typography } from 'Elements/cssMixins';
import styled from 'styled-components';
import styles from '../Singing/GameOverlay/Drawing/styles';

export const SongCardContainer = styled.div<{ width: number }>`
    font-size: ${(props) => props.width * 0.065}px;

    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;

    box-sizing: border-box;
`;

export const SongCardBackground = styled.div.attrs<{ video: string }>((props) => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
    },
}))<{ video: string; focused: boolean }>`
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-position: center center;
    // background-size: ${(props) => (props.focused ? 150.5 : 180)}%;
    background-size: ${(props) => (props.focused ? 100 : 110)}%;
    ${(props) => (props.focused ? '' : 'filter: grayscale(90%);')}

    opacity: ${(props) => (props.focused ? 1 : 0.8)};

    border-radius: 5px;
    transition: 300ms;
`;

export const SongCard = styled(SongCardContainer)`
    cursor: pointer;
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
