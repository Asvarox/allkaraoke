import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTheme } from '@mui/material';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'Elements/VideoPlayer';
import {
  FinalSongCard,
  SongListEntryDetailsArtist,
  SongListEntryDetailsTitle,
} from 'Scenes/SingASong/SongSelection/SongCard';
import SongSettings from 'Scenes/SingASong/SongSelection/SongSettings';
import useDebounce from 'hooks/useDebounce';
import useViewportSize from 'hooks/useViewportSize';
import { SingSetup, SongPreview } from 'interfaces';
import { ComponentProps, PropsWithChildren, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { songId: string; video: string }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
  top: number;
  left: number;
  width: number;
  height: number;
  focusEffect: boolean;
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
  focusEffect,
}: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const player = useRef<VideoPlayerRef | null>(null);
  const { width: windowWidth, height: windowHeight } = useViewportSize();

  const expanded = keyboardControl;

  // need to use layout effect otherwise newly selected song name is displayed briefly before the element is removed
  useLayoutEffect(() => {
    setShowVideo(false);
  }, [songPreview.video]);

  const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
  const end = songPreview.previewEnd ?? start + PREVIEW_LENGTH;
  const undebounced = useMemo(
    () => [songPreview.video, start, end, songPreview.volume] as const,
    [songPreview.video, start, end, songPreview.volume],
  );
  const [videoId, previewStart, previewEnd, volume] = useDebounce(undebounced, 350);

  useEffect(() => {
    player.current?.loadVideoById({
      videoId: videoId,
      startSeconds: previewStart,
      endSeconds: previewEnd,
    });
  }, [videoId, player, previewStart, previewEnd]);

  const finalWidth = expanded ? windowWidth! : width;
  const finalHeight = expanded ? Math.min((windowWidth! / 20) * 9, windowHeight! * (4 / 5)) : height;

  useEffect(() => {
    player.current?.setSize(finalWidth, (finalWidth / 16) * 9);
  }, [finalWidth, keyboardControl]);

  return (
    <>
      {expanded && <Backdrop onClick={onExitKeyboardControl} />}
      {!expanded && showVideo && (
        <SongBPMIndicator width={finalWidth} height={finalHeight} left={left} top={top} song={songPreview} />
      )}
      <SongPreviewContainer
        background={expanded || showVideo}
        video={
          <Video show={showVideo} expanded={expanded} height={finalHeight}>
            <VideoPlayer
              width={0}
              height={0}
              disablekb
              ref={player}
              video={''}
              volume={volume}
              onStateChange={(state) => {
                if (state === VideoState.ENDED) {
                  player.current?.seekTo(start);
                  player.current?.playVideo();
                } else if (state === VideoState.PLAYING) {
                  setShowVideo(true);
                }
              }}
            />
          </Video>
        }
        focused
        song={songPreview}
        top={top}
        left={left}
        width={finalWidth}
        height={finalHeight}
        showVideo={showVideo}
        expanded={expanded}
        data-test="song-preview"
        data-song={songPreview.id}>
        {expanded && (
          <Content>
            <SongSettings
              songPreview={songPreview}
              onPlay={onPlay}
              keyboardControl={keyboardControl}
              onExitKeyboardControl={onExitKeyboardControl}
            />
          </Content>
        )}
      </SongPreviewContainer>
    </>
  );
}

const BaseSongPreviewContainer = styled(FinalSongCard)<{
  width: number;
  height: number;
  expanded: boolean;
  showVideo: boolean;
}>`
  --preview-padding: 5rem;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: absolute;
  z-index: ${(props) => (props.expanded ? 201 : 3)};
  overflow: hidden;
  visibility: ${(props) => (props.expanded || props.showVideo ? 'visible' : 'hidden')};

  ${(props) =>
    props.expanded
      ? css`
          border: 0;
          border-radius: 0;
          position: fixed;

          padding: var(--preview-padding);
        `
      : css`
          pointer-events: none;
          ${props.showVideo && props.theme.graphicSetting === 'high'
            ? 'animation: rhythmPulse 1s infinite'
            : 'scale: 1.2'};
        `};

  @keyframes rhythmPulse {
    0% {
      transform: scale(1.2);
    }
    15% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1.2);
    }
  }
  view-transition-name: song-preview;

  ${SongListEntryDetailsArtist} {
    view-transition-name: song-preview-artist;
  }

  ${SongListEntryDetailsTitle} {
    view-transition-name: song-preview-title;
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
  const realBpm = props.song.realBpm ?? (props.song.bpm > 300 ? props.song.bpm / 4 : props.song.bpm / 2);

  return (
    <BaseSongPreviewContainer
      style={{
        top: props.expanded ? `calc(50vh - ${props.height}px / 2)` : props.top,
        left: props.expanded ? 0 : props.left,
        animationDuration: `${60 / realBpm}s`,
      }}
      {...props}
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

const Video = styled.div<{ show: boolean; expanded: boolean; height: number }>`
  position: absolute;
  top: 0;
  left: 0;
  div {
    opacity: ${({ show }) => (show ? 1 : 0)};
    transition: ${({ show, expanded }) => (show || expanded ? 1000 : 0)}ms;
  }
  ${(props) => !props.expanded && 'background-image: none !important;'}
  ${(props) => !props.expanded && 'border-radius: 0.5rem;'}
    ${(props) => props.expanded && `margin-top: calc(-1 * (100vw / 16 * 9) / 2 + ${props.height / 2}px);`}
`;

const ContentBase = styled.div`
  inset: auto var(--preview-padding);
  position: fixed; /* makes sure Autocomplete dropdown doesn't get clipped */
  z-index: 100;

  border-radius: 0.5rem;
`;

const Content = ContentBase;

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
  const theme = useTheme();

  if (theme.graphicSetting === 'low') return null;

  const realBpm = props.song.realBpm ?? (props.song.bpm > 300 ? props.song.bpm / 4 : props.song.bpm / 2);
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
