import styled from '@emotion/styled';
import { SingSetup, SongPreview } from 'interfaces';
import { backgroundTheme, useBackground } from 'modules/Elements/LayoutWithBackground';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'modules/Elements/VideoPlayer';
import useDebounce from 'modules/hooks/useDebounce';
import useViewportSize from 'modules/hooks/useViewportSize';
import { isEurovisionSong } from 'modules/Songs/utils/specialSongsThemeChecks';
import { FeatureFlags } from 'modules/utils/featureFlags';
import useFeatureFlag from 'modules/utils/useFeatureFlag';
import {
  ComponentProps,
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BackgroundThemeSetting, GraphicSetting, useSettingValue } from 'routes/Settings/SettingsState';
import {
  ExpandedData,
  FinalSongCard,
  SongListEntryDetailsArtist,
  SongListEntryDetailsTitle,
} from 'routes/SingASong/SongSelection/Components/SongCard';
import SongSettings from 'routes/SingASong/SongSelection/Components/SongSettings';
import { ValuesType } from 'utility-types';

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

const useSpecialSongTheme = (
  songPreview: SongPreview,
  theme: backgroundTheme,
  checkFn: (song: SongPreview) => boolean,
) => {
  const [backgroundTheme, setBackgroundTheme] = useSettingValue(BackgroundThemeSetting);
  const isSpecialThemeSong = checkFn(songPreview);
  useBackground(true, isSpecialThemeSong ? theme : 'regular');

  useEffect(() => {
    if (isSpecialThemeSong) {
      setBackgroundTheme(theme);
    }
  }, []);

  useEffect(() => {
    if (backgroundTheme !== theme && isSpecialThemeSong) {
      setBackgroundTheme(theme);
    } else if (backgroundTheme === theme && !isSpecialThemeSong) {
      setBackgroundTheme('regular');
    }
  }, [theme, backgroundTheme, songPreview]);

  return isSpecialThemeSong;
};

export const useSpecialTheme = (
  songPreview: SongPreview,
  feature: ValuesType<typeof FeatureFlags>,
  check: (preview: SongPreview) => boolean,
  theme: backgroundTheme,
) => {
  const isSpecialThemeEnabled = useFeatureFlag(feature);
  const _isSpecialSong = useSpecialSongTheme(
    songPreview,
    isSpecialThemeEnabled ? theme : 'regular',
    isSpecialThemeEnabled ? check : () => false,
  );
};

export default function SongPreviewComponent({
  songPreview,
  top,
  left,
  width,
  height,
  keyboardControl,
  onExitKeyboardControl,
  onPlay,
  isPopular,
  forceFlag,
}: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const player = useRef<VideoPlayerRef | null>(null);
  const { width: windowWidth, height: windowHeight } = useViewportSize();
  useSpecialTheme(songPreview, FeatureFlags.Eurovision, isEurovisionSong, 'eurovision');

  const expanded = keyboardControl;

  const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
  const end = songPreview.previewEnd ?? start + PREVIEW_LENGTH;
  const undebounced = useMemo(
    () => [songPreview.video, start, end, songPreview.volume] as const,
    [songPreview.video, start, end, songPreview.volume],
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

  return (
    <>
      {expanded && <Backdrop onClick={onExitKeyboardControl} />}
      {!expanded && showVideo && (
        <SongBPMIndicator width={videoWidth} height={videoHeight} left={left} top={top} song={songPreview} />
      )}
      <SongPreviewContainer
        forceFlag={forceFlag}
        isPopular={isPopular}
        background={expanded || showVideo}
        video={
          <Video data-show={showVideo} data-expanded={expanded} height={finalHeight} id="preview-video-container">
            <VideoPlayer
              width={0}
              height={0}
              disablekb
              ref={player}
              video={''}
              volume={volume}
              onStateChange={onVideoStateChange}
            />
          </Video>
        }
        focused
        song={songPreview}
        top={top}
        left={left}
        width={videoWidth}
        height={finalHeight}
        data-show-video={showVideo}
        data-expanded={expanded}
        data-song={songPreview.id}
        data-test="song-preview">
        <Content data-expanded={expanded}>
          {expanded && (
            <SongSettings
              songPreview={songPreview}
              onPlay={onPlay}
              keyboardControl={keyboardControl}
              onExitKeyboardControl={onExitKeyboardControl}
            />
          )}
        </Content>
      </SongPreviewContainer>
    </>
  );
}

const BaseSongPreviewContainer = styled(FinalSongCard)<{
  width: number;
  height: number;
}>`
  --preview-padding: 5rem;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: absolute;
  z-index: 3;
  overflow: hidden;

  visibility: hidden;
  &[data-expanded='true'],
  &[data-show-video='true'] {
    visibility: visible;
  }
  &[data-expanded='true'] {
    z-index: 201;
    border-radius: 0;
    border: 0;
    position: fixed;
    padding: var(--preview-padding);
  }
  &[data-expanded='false'] {
    pointer-events: none;
    &[data-show-video='true'] {
      animation: rhythmPulse 1s infinite; // todo disable for graphic setting low
    }
  }

  @keyframes rhythmPulse {
    0% {
      transform: scale(1.15);
    }
    15% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1.15);
    }
  }
  view-transition-name: song-preview;

  ${SongListEntryDetailsArtist} {
    view-transition-name: song-preview-artist;
  }

  ${SongListEntryDetailsTitle} {
    view-transition-name: song-preview-title;
  }

  ${ExpandedData} {
    view-transition-name: song-preview-expanded-data;
  }
`;

interface SongPreviewContainerProps
  extends ComponentProps<typeof BaseSongPreviewContainer>,
    PropsWithChildren<{
      top: number;
      left: number;
      song: SongPreview;
    }> {}

const SongPreviewContainer = (props: SongPreviewContainerProps) => {
  const realBpm = props.song.realBpm || (props.song.bpm > 300 ? props.song.bpm / 4 : props.song.bpm / 2);
  const expanded = props['data-expanded'];

  return (
    <BaseSongPreviewContainer
      {...props}
      style={{
        ...props.style,
        top: expanded ? `calc(50vh - ${props.height}px / 2)` : props.top,
        left: expanded ? 0 : props.left,
        animationDuration: `${60 / realBpm}s`,
      }}
    />
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  width: 100vw;
  height: 100vh;
  z-index: 201;
`;

const Video = styled.div<{ height: number }>`
  &[data-expanded='true'] {
    position: fixed;
    inset: 0;
    clip-path: inset(calc((100vh - ${(props) => props.height}px) / 2) 0);
  }
  &[data-expanded='true'],
  &[data-show='true'] {
    div {
      transition: 1000ms;
    }
  }
  &[data-expanded='false'] {
    position: absolute;
    top: 0;
    left: 0;
    background-image: none !important;
    border-radius: 0.5rem;
  }

  &[data-show='false'] {
    div {
      opacity: 0;
    }
  }
  &[data-show='true'] {
    div {
      opacity: 1;
    }
  }
`;

const Content = styled.div`
  inset: auto var(--preview-padding);
  position: fixed; /* makes sure Autocomplete dropdown doesn't get clipped */
  z-index: 100;
  &[data-expanded='false'] {
    transform: scale(0.1);
  }

  border-radius: 0.5rem;

  view-transition-name: song-preview-content;
`;

const BaseSongBPMIndicator = styled.div<{ width: number; height: number }>`
  background: white;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  z-index: 2;
  top: 0;
  left: 0;
  position: absolute;
  animation: bpm 1s infinite;
  border-radius: 0.5rem;
  pointer-events: none;

  @keyframes bpm {
    0% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1.45);
      opacity: 0;
    }
  }
`;

const SongBPMIndicator = (
  props: {
    top: number;
    left: number;
    song: SongPreview;
  } & ComponentProps<typeof BaseSongBPMIndicator>,
) => {
  const [graphicSetting] = useSettingValue(GraphicSetting);

  if (graphicSetting === 'low') return null;

  const realBpm = props.song.realBpm || (props.song.bpm > 300 ? props.song.bpm / 4 : props.song.bpm / 2);
  return (
    <BaseSongBPMIndicator
      width={props.width}
      height={props.height}
      style={{
        left: props.left,
        top: props.top,
        animationDuration: `${60 / realBpm}s`,
      }}
    />
  );
};
