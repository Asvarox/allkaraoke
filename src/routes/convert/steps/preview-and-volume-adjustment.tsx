import { Slider } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';

import backgroundMusic from '~/assets/funk-cool-groove-(no-copyright-music)-by-anwar-amr.ogg';
import { SongMetadataEntity } from '~/routes/convert/steps/song-metadata';
import { msec } from '~/routes/convert/steps/sync-lyrics-to-video/helpers/format-ms';

interface Props {
  onChange: (data: SongMetadataEntity) => void;
  data: SongMetadataEntity;
  videoId: string;
  instrumentalVideoId?: string;
  videoGap?: number;
}

const MIN_PREVIEW_LENGTH = 10;

// Keeps the stored volume and the player's own volume control in sync, whichever one gets changed.
// A new `volume` from props (e.g. a fallback that moved) goes to the player; only a change made on the player is stored
function useSyncedPlayerVolume(player: RefObject<YouTube | null>, volume: number, onChange: (volume: number) => void) {
  const applied = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const internalPlayer = player.current?.getInternalPlayer();
      if (!internalPlayer) return;
      if (applied.current !== volume) {
        await internalPlayer.setVolume(volume * 100);
        applied.current = volume;
      } else {
        const currentVolume = await internalPlayer.getVolume();
        if (currentVolume !== undefined && currentVolume !== volume * 100) {
          applied.current = currentVolume / 100;
          onChange(currentVolume / 100);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [volume, onChange, player]);

  return async (value: number) => {
    await player.current?.getInternalPlayer()?.setVolume(value * 100);
    onChange(value);
  };
}

export default function PreviewAndVolumeAdjustment({
  data,
  onChange,
  videoId,
  instrumentalVideoId,
  videoGap = 0,
}: Props) {
  const player = useRef<YouTube | null>(null);
  const instrumentalPlayer = useRef<YouTube | null>(null);
  const reference = useRef<HTMLAudioElement | null>(null);
  // The video the reference sound pauses and resumes
  const lastPlayedVideo = useRef<YouTube | null>(null);

  useEffect(() => {
    if (data.volume === 0) onChange({ ...data, volume: 0.7 });
  }, [data, onChange]);

  // 0 means unset; the effect above stores the default
  const songVolume = data.volume || 0.7;
  const setVolume = useSyncedPlayerVolume(player, songVolume, (volume) => onChange({ ...data, volume }));
  const instrumentalVolume = data.instrumentalVolume ?? songVolume;
  const setInstrumentalVolume = useSyncedPlayerVolume(instrumentalPlayer, instrumentalVolume, (value) =>
    onChange({ ...data, instrumentalVolume: value }),
  );

  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const [isReferencePlaying, setIsReferencePlaying] = useState(false);

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

  const onVideoPlay = (video: YouTube | null) => {
    lastPlayedVideo.current = video;
    setIsPlayerPlaying(true);
    if (isReferencePlaying) {
      reference.current?.pause();
      setTimeout(() => setIsReferencePlaying(true), 200);
    }
  };
  const onVideoPause = () => {
    setIsReferencePlaying(false);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <h4 className="text-lg">
        Set song preview (start: {msec(previewStart * 1000, internalPlayer)}, end:{' '}
        {msec(previewEnd * 1000, internalPlayer)})
      </h4>
      <div className="px-5">
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
      </div>

      <h4 className="text-lg">Adjust volume</h4>
      <p>Use the sliders below to make each video roughly as loud as the reference sound.</p>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <VolumeVideo
          title="Song"
          videoId={videoId}
          playerRef={player}
          volume={songVolume}
          onVolumeChange={setVolume}
          sliderTestId="volume"
          onPlay={() => onVideoPlay(player.current)}
          onPause={onVideoPause}
        />
        {instrumentalVideoId && (
          <VolumeVideo
            title="Instrumental"
            videoId={instrumentalVideoId}
            playerRef={instrumentalPlayer}
            volume={instrumentalVolume}
            onVolumeChange={setInstrumentalVolume}
            sliderTestId="instrumental-volume"
            onPlay={() => onVideoPlay(instrumentalPlayer.current)}
            onPause={onVideoPause}
          />
        )}
        <div className="flex flex-col gap-2">
          <h5 className="text-md">Reference sound</h5>
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
                lastPlayedVideo.current?.getInternalPlayer()?.pauseVideo();
                setTimeout(() => setIsPlayerPlaying(true), 200);
              }
            }}
            onPause={() => {
              setIsReferencePlaying(false);
              if (isPlayerPlaying) {
                lastPlayedVideo.current?.getInternalPlayer()?.playVideo();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface VolumeVideoProps {
  title: string;
  videoId: string;
  playerRef: RefObject<YouTube | null>;
  volume: number;
  onVolumeChange: (volume: number) => void;
  sliderTestId: string;
  onPlay: () => void;
  onPause: () => void;
}

function VolumeVideo({
  title,
  videoId,
  playerRef,
  volume,
  onVolumeChange,
  sliderTestId,
  onPlay,
  onPause,
}: VolumeVideoProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h5 className="text-md">
        {title} volume ({Math.round(volume * 100)})
      </h5>
      <YouTube opts={{ width: '100%' }} videoId={videoId} ref={playerRef} onPlay={onPlay} onPause={onPause} />
      <div className="px-5">
        <Slider
          data-test={sliderTestId}
          min={0.1}
          max={1}
          step={0.01}
          aria-label={`${title} volume`}
          value={volume}
          onChange={(_e, value) => onVolumeChange(+value)}
        />
      </div>
    </div>
  );
}
