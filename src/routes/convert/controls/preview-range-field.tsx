import { Slider } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import YouTube from 'react-youtube';
import backgroundMusic from '~/assets/funk-cool-groove-(no-copyright-music)-by-anwar-amr.ogg';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { msec } from '~/routes/convert/steps/sync-lyrics-to-video/helpers/format-ms';

const MIN_PREVIEW_LENGTH = 10;

interface PreviewRangeFieldProps {
  videoGap?: number;
  videoId: string;
}

function PreviewRangeField({ videoId, videoGap = 0 }: PreviewRangeFieldProps) {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const previewStartValue = useWatch({ control, name: 'metadata.previewStart' });
  const previewEndValue = useWatch({ control, name: 'metadata.previewEnd' });
  const player = useRef<YouTube | null>(null);
  const reference = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const [isReferencePlaying, setIsReferencePlaying] = useState(false);

  const previewStart = previewStartValue ?? videoGap + 60;
  const previewEnd = previewEndValue ?? previewStart + 30;

  const syncReferenceAndDuration = (internalPlayer: { getDuration?: () => number | Promise<number> } | null) => {
    if (reference.current) {
      reference.current.currentTime = 35;
    }

    if (!internalPlayer || typeof internalPlayer.getDuration !== 'function') {
      return;
    }

    const durationResult = internalPlayer.getDuration();

    if (typeof durationResult === 'number') {
      setDuration(durationResult);
      return;
    }

    if (durationResult && typeof durationResult.then === 'function') {
      durationResult.then((nextDuration) => {
        if (typeof nextDuration === 'number') {
          setDuration(nextDuration);
        }
      });
    }
  };

  useEffect(() => {
    if (duration !== null && duration < previewEnd) {
      const singableLength = Math.max(duration - videoGap - MIN_PREVIEW_LENGTH, 0) / 2;
      const start = Math.max(videoGap + singableLength, 0);
      const end = Math.min(start + MIN_PREVIEW_LENGTH, duration);

      setValue('metadata.previewStart', start, { shouldDirty: true });
      setValue('metadata.previewEnd', end, { shouldDirty: true });
    }
  }, [duration, previewEnd, setValue, videoGap]);

  const internalPlayer = player.current?.getInternalPlayer();

  return (
    <div className="flex w-full flex-col gap-2">
      <h4>
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
          getAriaLabel={() => 'Preview'}
          onChange={(_event, value) => {
            const [start, end] = value as number[];
            if (end - start > MIN_PREVIEW_LENGTH) {
              setValue('metadata.previewStart', start, { shouldDirty: true });
              setValue('metadata.previewEnd', end, { shouldDirty: true });
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <h5>Song</h5>
          <YouTube
            opts={{
              width: '100%',
            }}
            videoId={videoId}
            ref={player}
            onReady={() => {
              const internalPlayer = player.current?.getInternalPlayer();
              syncReferenceAndDuration(internalPlayer ?? null);
            }}
            onPlay={() => {
              setIsPlayerPlaying(true);

              if (isReferencePlaying) {
                reference.current?.pause();
                setIsReferencePlaying(false);
              }
            }}
            onPause={() => {
              setIsPlayerPlaying(false);
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h5>Reference sound</h5>
          <p>Use the slider below to make the video volume roughly the same as this music.</p>
          <br />
          <audio
            ref={reference}
            controls
            src={backgroundMusic}
            loop
            onLoadedMetadata={(event) => (event.currentTarget.currentTime = 35)}
            onPlay={(event) => {
              event.currentTarget.volume = 0.5;
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
        </div>
      </div>
    </div>
  );
}

export default memo(PreviewRangeField);
