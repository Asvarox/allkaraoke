import { Box, Slider } from '@mui/material';
import YouTube from 'react-youtube';
import backgroundMusic from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.mp3';
import { SongMetadataEntity } from 'Scenes/Convert/Steps/SongMetadata';
import { useEffect, useRef } from 'react';

interface Props {
    onChange: (data: SongMetadataEntity) => void;
    data: SongMetadataEntity;
    videoId: string;
}

export default function VolumeAdjustment(props: Props) {
    const player = useRef<YouTube | null>(null);

    useEffect(() => {
        player.current?.getInternalPlayer().setVolume(props.data.volume * 100);
    }, [props.data.volume, player.current]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const currentVolume = await player.current?.getInternalPlayer().getVolume();

            if (currentVolume !== props.data.volume * 100) {
                props.onChange({ ...props.data, volume: currentVolume / 100 });
            }
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, [props.data, props.onChange, player.current]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <h3>Adjust volume</h3>
            <Box sx={{ display: 'flex', gap: 5 }}>
                <Box>
                    <h4>Song</h4>
                    <YouTube videoId={props.videoId} ref={player} />
                </Box>
                <Box>
                    <h4>Reference sound</h4>
                    <p>Use the slider below to make the video volume roughly the same as this music.</p>
                    <br />
                    <audio
                        controls
                        src={backgroundMusic}
                        loop
                        onPlay={(e) => {
                            e.currentTarget.volume = 0.5;
                        }}
                    />
                </Box>
            </Box>
            <h4>Final Song Volume ({props.data.volume * 100})</h4>
            <Box>
                <Slider
                    data-test="volume"
                    min={0}
                    max={1}
                    step={0.01}
                    aria-label="Volume"
                    value={props.data.volume}
                    onChange={(e, value) => props.onChange({ ...props.data, volume: +value })}
                />
            </Box>
        </Box>
    );
}
