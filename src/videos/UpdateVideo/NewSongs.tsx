import styled from '@emotion/styled';
import { SongPreview } from 'interfaces';
import React, { HTMLProps, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Series,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Fade, Scale } from 'remotion-animated';
import useAbsoluteFrame from 'videos/support/AbsoluteFrame/useAbsoluteFrame';
import { CenterAbsoluteFill, SAnimated } from 'videos/support/Components/common';
import { flexCenter, flexVertical } from 'videos/support/cssMixins';

const SONG_PRESENTATION_FRAMES = 70;
const TITLE_PRESENTATION_FRAMES = SONG_PRESENTATION_FRAMES;

export const getNewSongsSequenceLength = (_songs: SongPreview[]) =>
  9 * SONG_PRESENTATION_FRAMES + TITLE_PRESENTATION_FRAMES;

export const SingleSong = ({ song, durationInFrames }: { song: SongPreview; durationInFrames: number }) => {
  const [handle] = useState(() => delayRender());
  const [highResThumbnail, setHighResThumbnail] = useState<boolean | null>(null);
  const frame = useCurrentFrame();

  const titlePosition = interpolate(frame, [0, durationInFrames], [-900, 900], {
    easing: Easing.bezier(0, 0.95, 1, 0.05),
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`https://i3.ytimg.com/vi/${song.video}/maxresdefault.jpg`);
        setHighResThumbnail(res.status !== 404);
      } catch (_e) {
        setHighResThumbnail(false);
      }

      continueRender(handle);
    })();
  }, [song.video]);

  const thumbSrc = `https://i3.ytimg.com/vi/${song.video}/${highResThumbnail ? 'maxresdefault' : 'hqdefault'}.jpg`;

  return (
    <AbsoluteFill data-song={song.id}>
      <CenterAbsoluteFill>
        <SAnimated
          animations={[
            Fade({ to: 0.9, initial: 0, duration: 10 }),
            Fade({ to: 0, initial: 0.9, duration: 10, start: durationInFrames - 10 }),
          ]}>
          {highResThumbnail !== null && (
            // @ts-expect-error for some reason it expects weird props on Img
            <Img
              style={{
                opacity: highResThumbnail !== null ? 1 : 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: `blur(${highResThumbnail ? 2 : 5}px)`,
                transform: 'scale(1.5)',
              }}
              src={thumbSrc}
              placeholder={undefined}
            />
          )}
        </SAnimated>
      </CenterAbsoluteFill>
      <CenterAbsoluteFill style={{ gap: '1rem' }}>
        <TitleBar>
          <h1 style={{ transform: `translate(${titlePosition}px, 0)` }}>{song.artist}</h1>
          <h2 style={{ transform: `translate(${-titlePosition}px, 0)` }}>{song.title}</h2>
        </TitleBar>
      </CenterAbsoluteFill>
    </AbsoluteFill>
  );
};

const TitleBar = styled.div`
  //background: rgba(0, 0, 0, 0.75);
  padding: 2rem 0;
  width: 100%;
  ${flexVertical};
  ${flexCenter};
  gap: 1rem;
`;

export const NewSongs: React.FC<{ songs: SongPreview[]; songPack?: ReactNode }> = ({ songs, songPack }) => {
  const perSongTime = (getNewSongsSequenceLength(songs) - TITLE_PRESENTATION_FRAMES + 30) / songs.length;
  return (
    <Series>
      <Series.Sequence durationInFrames={TITLE_PRESENTATION_FRAMES}>
        <SAnimated animations={[Scale({ by: 1.5, duration: TITLE_PRESENTATION_FRAMES })]}>
          <h1>New songs</h1>
        </SAnimated>
      </Series.Sequence>
      <Series.Sequence durationInFrames={getNewSongsSequenceLength(songs) - TITLE_PRESENTATION_FRAMES} offset={-10}>
        {songPack && (
          // <PulseAnim>
          <SongPackTitleWrapper>{songPack}</SongPackTitleWrapper>
          // </PulseAnim>
        )}
        <Series>
          {songs.map((song, index) => {
            const length = index === songs.length - 1 ? perSongTime * 1.5 : perSongTime;
            return (
              <Series.Sequence durationInFrames={length} key={song.id} offset={index === 0 ? 0 : -10}>
                <SingleSong song={song} durationInFrames={length} />
              </Series.Sequence>
            );
          })}
        </Series>
      </Series.Sequence>
    </Series>
  );
};

const musicBpm = 120;
const musicOffset = 27;
const PulseAnim = ({ children, ...props }: PropsWithChildren<HTMLProps<HTMLDivElement>>) => {
  const { fps } = useVideoConfig();
  const frame = useAbsoluteFrame();
  const beatFrameLength = (60 / musicBpm) * fps;

  const cycle = ((frame + musicOffset) / beatFrameLength) % 1;
  const inter = interpolate(cycle, [0, 0.1, 0.9, 1], [1, 1.1, 1, 1]);

  return (
    <div {...props} style={{ transform: `scale(${inter})`, ...props?.style }}>
      {children}
    </div>
  );
};

const SongPackTitleWrapper = styled(PulseAnim)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  top: -38%;
  position: relative;
`;
