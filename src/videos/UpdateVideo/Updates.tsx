import React from 'react';
import { AbsoluteFill, Easing, interpolate, Series, useCurrentFrame } from 'remotion';
import { Fade, Scale } from 'remotion-animated';
import { CenterAbsoluteFill, SAnimated } from 'videos/support/Components/common';

const SONG_PRESENTATION_FRAMES = 110;
const TITLE_PRESENTATION_FRAMES = 75;

export interface UpdateEntry {
    title: React.ReactNode;
    description: React.ReactNode;
}

export const getUpdatesSequenceLength = (updates: UpdateEntry[]) =>
    updates.length * SONG_PRESENTATION_FRAMES + TITLE_PRESENTATION_FRAMES;

const POS_CHANGE = 200;
export const SingeUpdate = ({ update, durationInFrames }: { update: UpdateEntry; durationInFrames: number }) => {
    const frame = useCurrentFrame();

    const titlePosition = interpolate(frame, [0, durationInFrames], [POS_CHANGE, -POS_CHANGE], {
        easing: Easing.bezier(0, 0.5, 1, 0.5),
    });

    const opacity = 1 - Math.abs(titlePosition / POS_CHANGE);

    return (
        <AbsoluteFill>
            <CenterAbsoluteFill>
                <SAnimated
                    animations={[
                        Fade({ to: 0.9, initial: 0, duration: 10 }),
                        Fade({ to: 0, initial: 0.9, duration: 10, start: durationInFrames - 10 }),
                    ]}></SAnimated>
            </CenterAbsoluteFill>
            <CenterAbsoluteFill style={{ gap: '1rem', opacity, transform: `translate(0, ${titlePosition}px)` }}>
                <h2 style={{ textAlign: 'center' }}>{update.title}</h2>
                <div style={{ padding: '0 1rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    {update.description}
                </div>
            </CenterAbsoluteFill>
        </AbsoluteFill>
    );
};

export const Updates: React.FC<{ updates: UpdateEntry[] }> = ({ updates }) => {
    return (
        <Series>
            <Series.Sequence durationInFrames={TITLE_PRESENTATION_FRAMES}>
                <SAnimated
                    animations={[
                        Scale({ by: 1.5, duration: TITLE_PRESENTATION_FRAMES }),
                        Fade({ initial: 1, to: 0, start: TITLE_PRESENTATION_FRAMES - 15, duration: 15 }),
                    ]}>
                    <h1>Updates</h1>
                </SAnimated>
            </Series.Sequence>
            {updates.map((update, index) => {
                const length = index === updates.length - 1 ? SONG_PRESENTATION_FRAMES * 1.5 : SONG_PRESENTATION_FRAMES;
                return (
                    <Series.Sequence durationInFrames={length} key={index} offset={-10}>
                        <SingeUpdate update={update} durationInFrames={length} />
                    </Series.Sequence>
                );
            })}
        </Series>
    );
};
