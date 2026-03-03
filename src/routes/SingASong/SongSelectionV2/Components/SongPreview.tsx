import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SingSetup, SongPreview } from '~/interfaces';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/Elements/VideoPlayer';
import useDebounce from '~/modules/hooks/useDebounce';
import useViewportSize from '~/modules/hooks/useViewportSize';
import { isEurovisionSong } from '~/modules/Songs/utils/specialSongsThemeChecks';
import { FeatureFlags } from '~/modules/utils/featureFlags';
import useFeatureFlag from '~/modules/utils/useFeatureFlag';
import { GraphicSetting, useSettingValue } from '~/routes/Settings/SettingsState';
import SongSettings from '~/routes/SingASong/SongSelectionV2/Components/SongSettings';
import { useSpecialTheme } from '~/routes/SingASong/SongSelectionV2/Hooks/useSpecialTheme';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
  top: number;
  left: number;
  width: number;
  height: number;
  isPopular: boolean;
  forceFlag: boolean;
}

const PREVIEW_LENGTH = 30;

export default function SongPreviewComponent({
  songPreview,
  top,
  left,
  width,
  height,
  keyboardControl,
  onExitKeyboardControl,
  onPlay,
  isPopular: _isPopular,
  forceFlag: _forceFlag,
}: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const player = useRef<VideoPlayerRef | null>(null);
  const { width: windowWidth, height: windowHeight } = useViewportSize();
  useSpecialTheme(songPreview, FeatureFlags.Eurovision, isEurovisionSong, 'eurovision');
  const newVolumeFFEnabled = useFeatureFlag(FeatureFlags.NewVolume);
  const [graphicSetting] = useSettingValue(GraphicSetting);

  const expanded = keyboardControl;

  const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
  const end = songPreview.previewEnd ?? start + PREVIEW_LENGTH;
  const songPreviewVolume = newVolumeFFEnabled
    ? (songPreview.volume ?? songPreview.manualVolume)
    : songPreview.manualVolume;
  const undebounced = useMemo(
    () => [songPreview.video, start, end, songPreviewVolume] as const,
    [songPreview.video, start, end, songPreviewVolume],
  );
  const [videoId, previewStart, previewEnd, volume] = useDebounce(undebounced, 350);

  // need to use layout effect otherwise newly selected song name is displayed briefly before the element is removed
  useLayoutEffect(() => {
    // keep showing the video when the song quickly changes back to the same song
    setShowVideo(songPreview.video === videoId && player.current?.getStatus() === VideoState.PLAYING);
  }, [songPreview.video, videoId]);

  useEffect(() => {
    player.current?.loadVideoById({
      videoId: videoId,
      startSeconds: previewStart,
      endSeconds: previewEnd,
    });
    player.current?.playVideo();
  }, [videoId, player, previewStart, previewEnd]);

  const videoWidth = expanded ? windowWidth : width;
  const videoHeight = expanded ? windowHeight : height;

  const finalHeight = expanded ? Math.min((windowWidth! / 20) * 9, windowHeight! * (4 / 5)) : height;

  useEffect(() => {
    player.current?.setSize(videoWidth, videoHeight);
  }, [videoWidth, videoHeight, keyboardControl, videoId]);

  const onVideoStateChange = useCallback(
    (state: VideoState) => {
      if (state === VideoState.ENDED) {
        player.current?.seekTo(start);
        player.current?.playVideo();
      } else if (state === VideoState.PLAYING) {
        setShowVideo(true);
      }
    },
    [start],
  );

  const realBpm = songPreview.realBpm || (songPreview.bpm > 300 ? songPreview.bpm / 4 : songPreview.bpm / 2);

  const realBpmForIndicator =
    songPreview.realBpm && songPreview.realBpm > 40
      ? songPreview.realBpm
      : songPreview.bpm > 300
        ? songPreview.bpm / 4
        : songPreview.bpm / 2;

  return (
    <>
      <style>{`
        @keyframes bpm {
          0% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes rhythmPulse {
          0% { transform: scale(1.15); }
          15% { transform: scale(1.2); }
          100% { transform: scale(1.15); }
        }
      `}</style>

      {expanded && <div className="fixed inset-0 z-201 bg-black/80" onClick={onExitKeyboardControl} />}

      {!expanded && showVideo && graphicSetting !== 'low' && (
        <div
          className="pointer-events-none absolute z-2 rounded-lg bg-white"
          style={{
            width: videoWidth,
            height: videoHeight,
            left,
            top,
            animation: `bpm ${60 / realBpmForIndicator}s infinite`,
          }}
        />
      )}

      <div
        data-show-video={showVideo}
        data-expanded={expanded}
        data-song={songPreview.id}
        data-test="song-preview"
        className={`z-3 overflow-hidden ${expanded ? 'fixed z-201 p-12' : 'absolute'} ${!expanded && !showVideo ? 'invisible' : ''} ${!expanded && showVideo ? 'rounded-lg' : ''}`}
        style={{
          width: expanded ? '100vw' : videoWidth,
          height: finalHeight,
          top: expanded ? `calc(50vh - ${finalHeight}px / 2)` : top,
          left: expanded ? 0 : left,
          animation: !expanded && showVideo ? `rhythmPulse ${60 / realBpm}s infinite` : undefined,
          viewTransitionName: 'song-preview',
        }}>
        {/* Thumbnail background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://i3.ytimg.com/vi/${songPreview.video}/hqdefault.jpg')` }}
        />

        {/* Video overlay */}
        <div
          id="preview-video-container"
          data-show={showVideo}
          data-expanded={expanded}
          className={expanded ? 'fixed inset-0' : 'absolute inset-0 rounded-lg bg-transparent'}
          style={expanded ? { clipPath: `inset(calc((100vh - ${finalHeight}px) / 2) 0)` } : {}}>
          <div
            className={`transition-opacity ${showVideo ? 'opacity-100' : 'opacity-0'} ${expanded ? 'duration-1000' : ''}`}>
            <VideoPlayer
              width={0}
              height={0}
              disablekb
              ref={player}
              video={''}
              volume={volume}
              onStateChange={onVideoStateChange}
            />
          </div>
        </div>

        {/* Bottom scrim with artist/title */}
        {!showVideo && (
          <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-4">
            <div className="text-right text-2xl font-medium text-orange-400">{songPreview.artist}</div>
            <div className="mt-1 text-right text-xl text-white">{songPreview.title}</div>
          </div>
        )}

        {/* SongSettings content area */}
        <div
          data-expanded={expanded}
          className={`fixed inset-x-12 z-100 rounded-lg ${!expanded ? 'scale-[0.1]' : ''}`}
          style={{ viewTransitionName: 'song-preview-content' }}>
          {expanded && (
            <SongSettings
              songPreview={songPreview}
              onPlay={onPlay}
              keyboardControl={keyboardControl}
              onExitKeyboardControl={onExitKeyboardControl}
            />
          )}
        </div>
      </div>
    </>
  );
}
