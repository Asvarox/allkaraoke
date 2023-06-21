import AbsoluteFrameProvider from 'videos/support/AbsoluteFrame/Provider';
import { AbsoluteFill, Audio, interpolate, Series, useVideoConfig } from 'remotion';
import { Scene } from 'videos/support/Components/Scene';
import { Logo } from 'videos/support/Components/Logo';
import { SAnimated } from 'videos/support/Components/common';
import { GameScreens } from 'Elements/GameScreens';
import React from 'react';
import songIndex from '../../public/songs/index.json';
import { isAfter } from 'date-fns';
import { SongPreview } from 'interfaces';
import { getNewSongsSequenceLength, NewSongs } from 'videos/UpdateVideo/NewSongs';
import { css, Global } from '@emotion/react';
import { getUpdatesSequenceLength, Updates } from 'videos/UpdateVideo/Updates';
import { Fade, Move } from 'remotion-animated';
import music from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.mp3';

const lastUpdate = new Date('2023-06-08T09:26:15.631Z');

const data = {
    date: new Date('2023-06-21T09:26:15.631Z'),
    songPack: (
        <>
            <h1>Divas</h1>
            <h2>Song Pack</h2>
        </>
    ),
    newSongs: songIndex.filter(
        (song) => song.lastUpdate && isAfter(new Date(song.lastUpdate), lastUpdate),
    ) as SongPreview[],
    updates: [
        {
            title: (
                <>
                    Built in mic <strong>noise detection</strong>
                </>
            ),
            description: <h4>You will get notified if there's a lot of background noise picked by the mic</h4>,
        },
        {
            title: (
                <>
                    <strong>Search song</strong> improvements
                </>
            ),
            description: <h4>Search results now include all the songs (even excluded ones)</h4>,
        },
        {
            title: (
                <>
                    <strong>UI</strong> improvements
                </>
            ),
            description: (
                <>
                    <h4>Disallow unselecting all the languages</h4>
                    <h4>Improved troubleshooting guide for connections</h4>
                </>
            ),
        },
        {
            title: (
                <>
                    <strong>Add/Edit songs</strong> improvements
                </>
            ),
            description: (
                <>
                    <h4>Set song preview</h4>
                    <h4>Ignore casing for genres</h4>
                    <h4>Allow specifying multiple languages</h4>
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
            <Audio
                src={music}
                startFrom={msToFps(12_050)}
                volume={(f) =>
                    interpolate(f, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {
                        extrapolateLeft: 'clamp',
                    })
                }
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
