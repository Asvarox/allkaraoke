import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, Series, useCurrentFrame } from 'remotion';
import React, { useEffect, useState } from 'react';
import { SongPreview } from 'interfaces';
import { CenterAbsoluteFill, SAnimated } from 'videos/support/Components/common';
import styled from '@emotion/styled';
import { flexCenter, flexVertical } from 'videos/support/cssMixins';
import { Fade, Scale } from 'remotion-animated';

const SONG_PRESENTATION_FRAMES = 70;
const TITLE_PRESENTATION_FRAMES = SONG_PRESENTATION_FRAMES;

export const getNewSongsSequenceLength = (songs: SongPreview[]) =>
    songs.length * SONG_PRESENTATION_FRAMES + TITLE_PRESENTATION_FRAMES;

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
            } catch (e) {
                setHighResThumbnail(false);
            }

            continueRender(handle);
        })();
    }, [song.video]);

    const thumbSrc = `https://i3.ytimg.com/vi/${song.video}/${highResThumbnail ? 'maxresdefault' : 'hqdefault'}.jpg`;

    return (
        <AbsoluteFill data-song={song.file}>
            <CenterAbsoluteFill>
                <SAnimated
                    animations={[
                        Fade({ to: 0.9, initial: 0, duration: 10 }),
                        Fade({ to: 0, initial: 0.9, duration: 10, start: durationInFrames - 10 }),
                    ]}>
                    <Img
                        style={{
                            opacity: highResThumbnail !== null ? 1 : 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'blur(5px)',
                            transform: 'scale(1.5)',
                        }}
                        src={thumbSrc}
                    />
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

export const NewSongs: React.FC<{ songs: SongPreview[] }> = ({ songs }) => {
    return (
        <Series>
            <Series.Sequence durationInFrames={TITLE_PRESENTATION_FRAMES}>
                <SAnimated animations={[Scale({ by: 1.5, duration: TITLE_PRESENTATION_FRAMES })]}>
                    <h1>New songs</h1>
                </SAnimated>
            </Series.Sequence>
            {songs.map((song, index) => {
                const length = index === songs.length - 1 ? SONG_PRESENTATION_FRAMES * 1.5 : SONG_PRESENTATION_FRAMES;
                return (
                    <Series.Sequence durationInFrames={length} key={song.file} offset={-10}>
                        <SingleSong song={song} durationInFrames={length} />
                    </Series.Sequence>
                );
            })}
        </Series>
    );
};
