import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import { Button } from '../../../Elements/Button';
import { GAME_MODE, SingSetup, SongPreview } from '../../../interfaces';
import styles from '../Singing/Drawing/styles';
import SongPage, { ContentElement } from '../SongPage';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup) => void;
}

const gameModeNames = {
    [GAME_MODE.DUEL]: 'Duel',
};

const previewWidth = 1100;
const previewHeight = 400;

export default function SongSelection({ songPreview, onPlay }: Props) {
    const [showVideo, setShowVideo] = useState(false);
    const [mode, setMode] = useState(GAME_MODE.DUEL);
    const [playerTracks, setPlayerTracks] = useState<[number, number]>([0, songPreview.tracksCount - 1]);
    const player = useRef<YouTube | null>(null);

    const playerStart = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
    const playerEnd = songPreview.previewEnd ?? playerStart + 30;

    const togglePlayerTrack = (player: number) =>
        setPlayerTracks((tracks) => {
            const newTracks: [number, number] = [...tracks];
            newTracks[player] = (tracks[player] + 1) % songPreview.tracksCount;

            return newTracks;
        });

    useEffect(() => {
        setPlayerTracks([0, songPreview.tracksCount - 1]);
    }, [songPreview]);

    const vid = (
        <Video show={showVideo}>
            <YouTube
                ref={player}
                videoId={songPreview.video}
                opts={{
                    width: String(previewWidth),
                    height: ((previewWidth / 16) * 9).toFixed(0),
                    playerVars: {
                        autoplay: 1,
                        start: playerStart,
                        end: playerEnd,
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
                    <ConfigurationPosition>
                        Mode: <ConfigValue>{gameModeNames[mode]}</ConfigValue>
                    </ConfigurationPosition>
                    {songPreview.tracksCount > 1 && (
                        <>
                            <ConfigurationPosition onClick={() => togglePlayerTrack(0)}>
                                Player 1: <ConfigValue>Track {playerTracks[0] + 1}</ConfigValue>
                            </ConfigurationPosition>
                            <ConfigurationPosition onClick={() => togglePlayerTrack(1)}>
                                Player 2: <ConfigValue>Track {playerTracks[1] + 1}</ConfigValue>
                            </ConfigurationPosition>
                        </>
                    )}
                    <PlayButton onClick={() => onPlay({ songPreview, mode, playerTracks })}>
                        Play <span style={{ fontSize: '40px' }}>»</span>
                    </PlayButton>
                </GameConfiguration>
            </SongPage>
        </Sticky>
    );
}

const Sticky = styled.div`
    position: sticky;
    top: 0;
    z-index: 1;
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

const ConfigurationPosition = styled(ContentElement)`
    cursor: pointer;
`;

const ConfigValue = styled.span`
    color: ${styles.colors.text.active};
`;

const Video = styled.div<{ show: boolean }>`
    opacity: ${({ show }) => (show ? 1 : 0)};
    transition: 500ms;
    margin-top: ${-(((previewWidth / 16) * 9 - previewHeight) / 2)}px;
`;

const PlayButton = styled(Button)``;
