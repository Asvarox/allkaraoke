import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled, { css } from 'styled-components';
import { Button } from '../../../Elements/Button';
import { focusable } from '../../../Elements/cssMixins';
import useDebounce from '../../../Hooks/useDebounce';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { GAME_MODE, SingSetup, SongPreview } from '../../../interfaces';
import styles from '../Singing/Drawing/styles';
import SongPage, { ContentElement } from '../SongPage';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup) => void;
    keyboardControl: boolean,
    onExitKeyboardControl: () => void,
}

const gameModeNames = {
    [GAME_MODE.DUEL]: 'Duel',
};

const previewWidth = 1100;
const previewHeight = 400;

enum Element {
    PLAY,
    PLAYER_2_TRACK,
    PLAYER_1_TRACK,
    MODE,
}

export default function SongSelection({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
    const [showVideo, setShowVideo] = useState(false);
    const [mode, setMode] = useState(GAME_MODE.DUEL);
    const [playerTracks, setPlayerTracks] = useState<[number, number]>([0, songPreview.tracksCount - 1]);
    const player = useRef<YouTube | null>(null);
    const [focusedElement, setFocusedEelement] = useState<number>(0);

    const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
    const [videoId, previewStart, previewEnd] = useDebounce([
        songPreview.video,
        start,
        songPreview.previewEnd ?? start + 30,
    ], 350);

    const multipleTracks = songPreview.tracksCount > 1;

    const togglePlayerTrack = (player: number) =>
        setPlayerTracks((tracks) => {
            const newTracks: [number, number] = [...tracks];
            newTracks[player] = (tracks[player] + 1) % songPreview.tracksCount;

            return newTracks;
        });

    const startSong = () => onPlay({ songPreview, mode, playerTracks });

    const enabledElements = multipleTracks
        ? [Element.PLAY, Element.PLAYER_2_TRACK, Element.PLAYER_1_TRACK, Element.MODE]
        : [Element.PLAY, Element.MODE];

    const isFocused = (elem: Element) => keyboardControl && enabledElements[focusedElement] === elem;

    const handleNavigation = (i: number, elements: Element[]) => {
        setFocusedEelement((elements.length + i + focusedElement) % elements.length);
    }

    const handleEnter = () => {
        if (isFocused(Element.PLAY)) startSong();
        else if (isFocused(Element.PLAYER_1_TRACK)) togglePlayerTrack(0);
        else if (isFocused(Element.PLAYER_2_TRACK)) togglePlayerTrack(1);
    }

    useKeyboardNav({
        onUpArrow: () => handleNavigation(1, enabledElements),
        onDownArrow: () => handleNavigation(-1, enabledElements),
        onEnter: () => handleEnter(),
        onBackspace: onExitKeyboardControl,
    }, keyboardControl, [enabledElements, songPreview, mode, playerTracks]);


    useEffect(() => {
        player.current?.getInternalPlayer().loadVideoById({
            videoId: videoId,
            startSeconds: previewStart,
            endSeconds: previewEnd,
        });
    }, [videoId, player, previewStart, previewEnd]);

    useEffect(() => {
        setPlayerTracks([0, songPreview.tracksCount - 1]);
    }, [songPreview]);

    const vid = (
        <Video show={showVideo}>
            <YouTube
                ref={player}
                videoId={''}
                opts={{
                    width: String(previewWidth),
                    height: ((previewWidth / 16) * 9).toFixed(0),
                    playerVars: {
                        autoplay: 1,
                        start: 0,
                        end: 0,
                        showinfo: 0,
                        rel: 0,
                        fs: 0,
                        controls: 0,
                        disablekb: 1,
                    },
                }}
                onStateChange={({ data }) => {
                    if (data === YouTube.PlayerState.ENDED) {
                        setShowVideo(false);
                    } else if (data === YouTube.PlayerState.PLAYING) {
                        setShowVideo(true);
                    }
                }}
            />
        </Video>
    );

    return (
        <Sticky>
            <SongPage songData={songPreview} width={previewWidth} height={previewHeight} background={vid}>
                <GameConfiguration>
                    <ConfigurationPosition focused={isFocused(Element.MODE)}>
                        Mode: <ConfigValue>{gameModeNames[mode]}</ConfigValue>
                    </ConfigurationPosition>
                    {songPreview.tracksCount > 1 && (
                        <>
                            <ConfigurationPosition onClick={() => togglePlayerTrack(0)} focused={isFocused(Element.PLAYER_1_TRACK)}>
                                Player 1: <ConfigValue>Track {playerTracks[0] + 1}</ConfigValue>
                            </ConfigurationPosition>
                            <ConfigurationPosition onClick={() => togglePlayerTrack(1)} focused={isFocused(Element.PLAYER_2_TRACK)}>
                                Player 2: <ConfigValue>Track {playerTracks[1] + 1}</ConfigValue>
                            </ConfigurationPosition>
                        </>
                    )}
                    <PlayButton onClick={startSong} focused={isFocused(Element.PLAY)}>
                        Play <span style={{ fontSize: '40px' }}>»</span>
                    </PlayButton>
                </GameConfiguration>
            </SongPage>
        </Sticky>
    );
}

const Sticky = styled.div`
`;

const GameConfiguration = styled.div`
    width: auto;
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 25px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const ConfigurationPosition = styled(ContentElement)<{ focused: boolean }>`
    cursor: pointer;

    ${focusable}
`;

const ConfigValue = styled.span`
    color: ${styles.colors.text.active};
`;

const Video = styled.div<{ show: boolean }>`
    opacity: ${({ show }) => (show ? 1 : 0)};
    transition: 500ms;
    margin-top: ${-(((previewWidth / 16) * 9 - previewHeight) / 2)}px;
`;

const PlayButton = styled(Button)<{ focused: boolean }>`${focusable}`;
