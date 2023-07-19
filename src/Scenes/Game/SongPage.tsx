import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { Song, SongPreview } from 'interfaces';
import styles from './Singing/GameOverlay/Drawing/styles';

interface Props {
    width: number;
    height: number;
    songData: SongPreview | Song;
    children: React.ReactNode;
    background?: React.ReactNode;
}

export default function SongPage({ songData, background, width, height, children, ...restProps }: Props) {
    return (
        <FocusedSongContainer video={songData.video} width={width} height={height} {...restProps}>
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

const BaseBackgroundImage = styled(Background)<{ blur: boolean; video: string }>`
    background-size: cover;
    background-position: center center;

    filter: ${(props) => (props.blur ? 'blur(0.5rem)' : 'none')};
`;

const BackgroundImage = (props: { blur: boolean; video: string }) => (
    <BaseBackgroundImage
        style={{ backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')` }}
        {...props}
    />
);

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
    max-width: 144rem;
    height: 100%;
    pointer-events: none;
`;

export const ContentElement = styled.span`
    background: rgba(0, 0, 0, 0.5);
    display: inline-block;
    backdrop-filter: blur(0.5rem);
    ${typography};
    padding: 0.5rem 2rem;
    margin: 0 0 1rem 2rem;
`;

const SongTitle = styled(ContentElement)`
    color: ${styles.colors.text.active};
    margin-top: 2rem;
    font-size: 4.5rem;
`;

const SongArtist = styled(ContentElement)`
    font-size: 3.5rem;
`;

const SongCreator = styled(ContentElement)`
    font-size: 2rem;
`;
