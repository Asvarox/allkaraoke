import styled from 'styled-components';
import { Song, SongPreview } from '../../interfaces';
import styles from './Singing/Drawing/styles';

interface Props {
    width: number;
    height: number;
    songData: SongPreview | Song;
    children: React.ReactNode;
    background?: React.ReactNode;
}

export default function SongPage({ songData, background, width, height, children }: Props) {
    return (
        <FocusedSongContainer video={songData.video} width={width} height={height}>
            <BackgroundImage video={songData.video} blur />
            {background && <Background>{background}</Background>}
            <ContentLayer>
                <FocusedSongData>
                    <SongTitle>{songData.title}</SongTitle>
                    <br />
                    <SongArtist>{songData.artist}</SongArtist>
                    <br />
                    {songData.author && (
                        <SongCreator>
                            by&nbsp;
                            {songData.authorUrl ? <a href={songData.authorUrl}>{songData.author}</a> : songData.author}
                        </SongCreator>
                    )}
                    {children}
                </FocusedSongData>
            </ContentLayer>
        </FocusedSongContainer>
    );
}

const FocusedSongContainer = styled.div<{ video: string; width: number; height: number }>(
    (props) => `
    width: ${props.width}px;
    top: 0;
    height: ${props.height}px;
    overflow-y: hidden;
    background: black;
    position: relative;
`,
);

const Background = styled.div`
    z-index: 1;
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
`;

const BackgroundImage = styled(Background).attrs<{ blur: boolean; video: string }>((props) => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
    },
}))<{ blur: boolean; video: string }>`
    background-size: cover;
    background-position: center center;

    filter: ${(props) => (props.blur ? 'blur(5px)' : 'none')};
`;

const ContentLayer = styled.div`
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none;
`;

const FocusedSongData = styled.div`
    position: relative;
    margin: 0 auto;
    color: white;
    max-width: 1440px;
    height: 100%;
    pointer-events: none;
`;

export const ContentElement = styled.span`
    background: rgba(0, 0, 0, 0.5);
    display: inline-block;
    backdrop-filter: blur(5px);
    -webkit-text-stroke: 1px black;
    padding: 5px 20px;
    margin: 0 0 10px 20px;
    font-weight: bold;

    a {
        text-decoration: none;
        -webkit-text-stroke: 1px black;
        color: ${styles.colors.text.active};
    }
`;

const SongTitle = styled(ContentElement)`
    color: ${styles.colors.text.active};
    margin-top: 20px;
    font-size: 45px;
`;

const SongArtist = styled(ContentElement)`
    font-size: 35px;
`;

const SongCreator = styled(ContentElement)`
    font-size: 20px;
`;
