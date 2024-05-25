import { css, Global } from '@emotion/react';
import music from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.ogg';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import { GameScreens } from 'modules/Elements/GameScreens';
import React from 'react';
import { AbsoluteFill, Audio, interpolate, Series, useVideoConfig } from 'remotion';
import { Fade, Move } from 'remotion-animated';
import AbsoluteFrameProvider from 'videos/support/AbsoluteFrame/Provider';
import { SAnimated } from 'videos/support/Components/common';
import { Logo } from 'videos/support/Components/Logo';
import { Scene } from 'videos/support/Components/Scene';
import { getNewSongsSequenceLength, NewSongs } from 'videos/UpdateVideo/NewSongs';
import { getUpdatesSequenceLength, Updates } from 'videos/UpdateVideo/Updates';
import songIndex from '../../public/songs/index.json';

const lastUpdate = dayjs('2023-09-01T09:26:15.631Z');

const data = {
  date: new Date('2023-09-22T09:26:15.631Z'),
  songPack: null,
  newSongs: (songIndex as any as SongPreview[]).filter(
    (song) => song.lastUpdate && dayjs(song.lastUpdate).isAfter(lastUpdate),
  ),
  updates: [
    {
      title: (
        <>
          Remote microphones <strong>management</strong>
        </>
      ),
      description: <></>,
    },
    {
      title: <></>,
      description: (
        <h4>
          In the <strong>options</strong>, you can block new/existing mics from controlling the game
        </h4>
      ),
    },
    {
      title: <></>,
      description: <h4>You can do the same from the remote microphone itself</h4>,
    },
    {
      title: (
        <>
          <strong>A lot more</strong> improvements
        </>
      ),
      description: (
        <>
          <h4>Made over the past couple months</h4>
        </>
      ),
    },
  ],
};

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const msToFps = (ms: number) => (ms / 1000) * 30;

export const getUpdateVideoLength = () =>
  120 + getNewSongsSequenceLength(data.newSongs) - 30 + getUpdatesSequenceLength(data.updates) + 120;

export const UpdateVideo: React.FC<{}> = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <GameScreens>
      {/* @ts-expect-error */}
      <Audio
        src={music}
        startFrom={msToFps(12_050)}
        volume={(f) =>
          interpolate(f, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
          })
        }
        placeholder={undefined}
      />
      <Global
        styles={css`
          html {
            font-size: 30px;
          }
        `}
      />
      <AbsoluteFrameProvider>
        <Series>
          <Series.Sequence durationInFrames={150}>
            <Scene color={'blue'} id="start" transition={false}>
              <AbsoluteFill style={{ top: 170, left: 130 }}>
                <SAnimated
                  style={{ opacity: 0 }}
                  animations={[Fade({ to: 1, initial: 0, duration: 20 }), Move({ y: -20 })]}
                  delay={65}>
                  <h3>
                    Update <strong>{dateFormat.format(data.date)}</strong>
                  </h3>
                </SAnimated>
              </AbsoluteFill>
              <Logo />
            </Scene>
          </Series.Sequence>

          <Series.Sequence durationInFrames={getNewSongsSequenceLength(data.newSongs)} offset={-30}>
            <Scene color={'red'} id="New-songs">
              <NewSongs songs={data.newSongs} songPack={data.songPack} />
            </Scene>
          </Series.Sequence>
          <Series.Sequence durationInFrames={getUpdatesSequenceLength(data.updates)} offset={-30}>
            <Scene color={'blue'} id="updates">
              <Updates updates={data.updates} />
            </Scene>
          </Series.Sequence>
          <Series.Sequence durationInFrames={150} offset={-30}>
            <Scene color={'red'} id="ending">
              <SAnimated
                style={{ flexDirection: 'column' }}
                animations={[
                  Fade({ to: 0, initial: 1, duration: 30, start: 120 }),
                  Move({ initialY: 100, y: -100, duration: 150 }),
                ]}>
                <h2 style={{ textAlign: 'center' }}>Play now on</h2>
                <h1>AllKaraoke.Party</h1>
              </SAnimated>
            </Scene>
          </Series.Sequence>
          <Series.Sequence durationInFrames={30} offset={-30}>
            <Scene color={'blue'} id="clear" />
          </Series.Sequence>
        </Series>
      </AbsoluteFrameProvider>
    </GameScreens>
  );
};
