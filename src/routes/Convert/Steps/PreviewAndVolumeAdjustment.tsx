import { Box, Slider } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import backgroundMusic from '~/assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.ogg';
import { SongMetadataEntity } from '~/routes/Convert/Steps/SongMetadata';
import { msec } from '~/routes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';

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
    const interval = setInterval(async () => {
      if (!initialised) {
        if (data.volume === 0) {
          onChange({ ...data, volume: 0.7 });
          await player.current?.getInternalPlayer()?.setVolume(70);
        } else {
          await player.current?.getInternalPlayer()?.setVolume(data.volume * 100);
        }
        setInitialised(true);
      } else {
        const currentVolume = await player.current?.getInternalPlayer()?.getVolume();
        if (currentVolume !== undefined && currentVolume !== data.volume * 100) {
          onChange({ ...data, volume: currentVolume / 100 });
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [initialised, data, onChange]);

  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const [isReferencePlaying, setIsReferencePlaying] = useState(false);

  const handleSliderChange = async (_e: unknown, value: number | number[]) => {
    await player.current?.getInternalPlayer()?.setVolume(+value * 100);
    onChange({ ...data, volume: +value });
  };

  const previewStart = data.previewStart ?? videoGap + 60;
  const previewEnd = data.previewEnd ?? previewStart + 30;
  const [duration, setDuration] = useState<number | null>(null);
  useEffect(() => {
    if (reference.current) {
      reference.current.currentTime = 35;
    }
    player.current?.getInternalPlayer()?.getDuration().then(setDuration);
  }, []);

  useEffect(() => {
    if (duration !== null && duration < previewEnd) {
      const singableLength = Math.max(duration - videoGap - MIN_PREVIEW_LENGTH, 0) / 2;
      const start = Math.max(videoGap + singableLength, 0);
      const end = Math.max(start + MIN_PREVIEW_LENGTH, duration);

      onChange({
        ...data,
        previewStart: start,
        previewEnd: end,
      });
    }
  }, [duration, data, previewEnd, onChange, videoGap]);

  const internalPlayer = player.current?.getInternalPlayer();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }} gap={1}>
      <h4>
        Set song preview (start: {msec(previewStart * 1000, internalPlayer)}, end:{' '}
        {msec(previewEnd * 1000, internalPlayer)})
      </h4>
      <Box sx={{ display: 'flex', gap: 5 }}>
        <Slider
          data-test="song-preview"
          disabled={duration === null}
          step={1}
          value={[previewStart, previewEnd]}
          max={(duration ?? 500) - MIN_PREVIEW_LENGTH}
          onChange={(_e, value) => {
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

      <h4>Adjust volume</h4>
      <Box sx={{ display: 'flex', gap: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <h5>Song</h5>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <h5>Reference sound</h5>
          <p>Use the slider below to make the video volume roughly the same as this music.</p>
          <br />
          <audio
            ref={reference}
            controls
            src={backgroundMusic}
            loop
            onLoad={(e) => (e.currentTarget.currentTime = 35)}
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
      <h5>Final Song Volume ({data.volume * 100})</h5>
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
