import { Box, Slider } from '@mui/material';
import { SongMetadataEntity } from 'Scenes/Convert/Steps/SongMetadata';
import { msec } from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import backgroundMusic from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.mp3';
import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';

interface Props {
    onChange: (data: SongMetadataEntity) => void;
    data: SongMetadataEntity;
    videoId: string;
    videoGap?: number;
}

const MIN_PREVIEW_LENGTH = 10;

export default function PreviewAndVolumeAdjustment({ data, onChange, videoId, videoGap = 0 }: Props) {
    const player = useRef<YouTube | null>(null);
    const reference = useRef<HTMLAudioElement | null>(null);

    const [initialised, setInitialised] = useState(false);
    useEffect(() => {
        (async () => {
            if (data.volume === 0) {
                onChange({ ...data, volume: 0.5 });
                await player.current?.getInternalPlayer()?.setVolume(50);
            } else {
                await player.current?.getInternalPlayer()?.setVolume(data.volume * 100);
            }
            setInitialised(true);
        })();
    }, []);

    useEffect(() => {
        if (!initialised) {
            return;
        }
        const interval = setInterval(async () => {
            const currentVolume = await player.current?.getInternalPlayer()?.getVolume();
            if (currentVolume !== undefined && currentVolume !== data.volume * 100) {
                onChange({ ...data, volume: currentVolume / 100 });
            }
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, [initialised, data, onChange]);

    const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
    const [isReferencePlaying, setIsReferencePlaying] = useState(false);

    const handleSliderChange = async (e: any, value: number | number[]) => {
        await player.current?.getInternalPlayer()?.setVolume(+value * 100);
        onChange({ ...data, volume: +value });
    };

    const previewStart = data.previewStart ?? videoGap + 60;
    const previewEnd = data.previewEnd ?? previewStart + 30;
    const [duration, setDuration] = useState<number | null>(null);
    useEffect(() => {
        player.current?.getInternalPlayer()?.getDuration().then(setDuration);
    }, []);

    const internalPlayer = player.current?.getInternalPlayer();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <h3>
                Set song preview (start: {msec(previewStart * 1000, internalPlayer)}, end:{' '}
                {msec(previewEnd * 1000, internalPlayer)})
            </h3>
            <Box sx={{ display: 'flex', gap: 5 }}>
                <Slider
                    data-test="song-preview"
                    disabled={duration === null}
                    step={1}
                    value={[previewStart, previewEnd]}
                    max={(duration ?? 500) - MIN_PREVIEW_LENGTH}
                    onChange={(e, value) => {
                        const [start, end] = value as number[];
                        if (end - start > MIN_PREVIEW_LENGTH) {
                            onChange({
                                ...data,
                                previewStart: start,
                                previewEnd: end,
                            });
                        }
                    }}
                />
            </Box>

            <h3>Adjust volume</h3>
            <Box sx={{ display: 'flex', gap: 5 }}>
                <Box>
                    <h4>Song</h4>
                    <YouTube
                        videoId={videoId}
                        ref={player}
                        onPlay={() => {
                            setIsPlayerPlaying(true);

                            if (isReferencePlaying) {
                                reference.current?.pause();
                                setTimeout(() => setIsReferencePlaying(true), 200);
                            }
                        }}
                        onPause={() => {
                            setIsReferencePlaying(false);
                        }}
                    />
                </Box>
                <Box>
                    <h4>Reference sound</h4>
                    <p>Use the slider below to make the video volume roughly the same as this music.</p>
                    <br />
                    <audio
                        ref={reference}
                        controls
                        src={backgroundMusic}
                        loop
                        onPlay={(e) => {
                            e.currentTarget.volume = 0.5;
                            setIsReferencePlaying(true);
                            if (isPlayerPlaying) {
                                player.current?.getInternalPlayer()?.pauseVideo();
                                setTimeout(() => setIsPlayerPlaying(true), 200);
                            }
                        }}
                        onPause={() => {
                            setIsReferencePlaying(false);
                            if (isPlayerPlaying) {
                                player.current?.getInternalPlayer()?.playVideo();
                            }
                        }}
                    />
                </Box>
            </Box>
            <h4>Final Song Volume ({data.volume * 100})</h4>
            <Box>
                <Slider
                    data-test="volume"
                    min={0.1}
                    max={1}
                    step={0.01}
                    aria-label="Volume"
                    value={data.volume}
                    onChange={handleSliderChange}
                />
            </Box>
        </Box>
    );
}
