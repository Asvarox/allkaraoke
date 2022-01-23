import { shuffle } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import { Link, useLocation } from 'wouter';
import { Button } from '../../Elements/Button';
import { focusable } from '../../Elements/cssMixins';
import useKeyboardNav from '../../Hooks/useKeyboardNav';
import { SongPreview } from '../../interfaces';
import useWindowSize from '../Game/Singing/useWindowSize';
import SongPage from '../Game/SongPage';

interface Props {}

export interface PlayerRef {
    // getCurrentTime: () => number,
    seekTo: (time: number) => void;
    setPlaybackSpeed: (speed: number) => void;
}

enum Element {
    SING_SONG,
    SKIP,
}

function Jukebox(props: Props) {
    const [, setLocation] = useLocation();
    const { width, height } = useWindowSize();
    const player = useRef<YouTube | null>(null);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(0);
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );

    const [shuffledList, setShuffledList] = useState<SongPreview[]>([]);

    useEffect(() => songList.data && setShuffledList(shuffle(songList.data)), [songList.data]);

    const playNext = () => songList.data && setCurrentlyPlaying((current) => (current + 1) % songList.data.length);

    const enabledElements = [Element.SING_SONG, Element.SKIP];
    const [focusedElement, setFocusedEelement] = useState<number>(0);
    const isFocused = (elem: Element) => enabledElements[focusedElement] === elem;

    const handleNavigation = (i: number, elements: Element[]) => {
        setFocusedEelement((elements.length + i + focusedElement) % elements.length);
    };

    const handleEnter = () => {
        if (!songList.data) return;
        else if (isFocused(Element.SKIP)) playNext();
        else if (isFocused(Element.SING_SONG))
            setLocation(`/game/${encodeURIComponent(shuffledList[currentlyPlaying].file)}`);
    };

    useKeyboardNav(
        {
            onUpArrow: () => handleNavigation(1, enabledElements),
            onDownArrow: () => handleNavigation(-1, enabledElements),
            onEnter: () => handleEnter(),
        },
        true,
        [focusedElement],
    );

    useEffect(() => {
        if (!player.current) {
            return;
        }

        player.current.getInternalPlayer().setSize(width, height);
        player.current.getInternalPlayer().setVolume(Math.round((shuffledList[currentlyPlaying].volume ?? 0.5) * 100));
    }, [player, width, height, shuffledList, currentlyPlaying]);

    if (!shuffledList.length || !width || !height) return null;

    return (
        <SongPage
            width={width}
            height={height}
            songData={shuffledList[currentlyPlaying]}
            background={
                <YouTube
                    ref={player}
                    videoId={shuffledList[currentlyPlaying].video}
                    opts={{
                        width: String(width),
                        height: String(height),
                        playerVars: {
                            autoplay: 1,
                            showinfo: 1,
                            rel: 0,
                            fs: 0,
                            controls: 1,
                            start: shuffledList[currentlyPlaying].videoGap ?? 0,
                        },
                    }}
                    onStateChange={(e) => {
                        if (e.data === YouTube.PlayerState.ENDED) playNext();
                    }}
                />
            }>
            <SkipSongButton onClick={playNext} focused={isFocused(Element.SKIP)}>
                Skip
            </SkipSongButton>
            <Link to={`/game/${encodeURIComponent(shuffledList[currentlyPlaying].file)}`}>
                <PlayThisSongButton focused={isFocused(Element.SING_SONG)}>Sing this song</PlayThisSongButton>
            </Link>
        </SongPage>
    );
}

const PlayThisSongButton = styled(Button)<{ focused: boolean }>`
    bottom: 70px;
    right: 20px;
    width: 500px;
    position: absolute;

    ${focusable}
`;

const SkipSongButton = styled(Button)<{ focused: boolean }>`
    bottom: 150px;
    right: 20px;
    width: 300px;
    position: absolute;

    ${focusable}
`;

export default Jukebox;
