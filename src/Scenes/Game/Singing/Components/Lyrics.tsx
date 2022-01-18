import { Fragment } from 'react';
import styled from 'styled-components';
import { Section } from '../../../../interfaces';
import styles from '../Drawing/styles';
import isNotesSection from '../Helpers/isNotesSection';
import { getFirstNoteStartFromSections } from '../Helpers/notesSelectors';

interface Props {
    section: Section;
    nextSection?: Section;
    bottom?: boolean;
    playerChanges: number[];
    currentBeat: number;
    beatLength: number;
    effectsEnabled: boolean;
}

function Lyrics({
    section,
    nextSection,
    currentBeat,
    playerChanges,
    bottom = false,
    beatLength,
    effectsEnabled,
}: Props) {
    const nextChange = playerChanges.find((beat) => beat > section?.start ?? Infinity);
    const shouldBlink = !!nextChange && nextChange * beatLength - 2500 < currentBeat * beatLength;

    const hasNotes = isNotesSection(section);

    const beatsBetweenSectionAndNote = hasNotes ? getFirstNoteStartFromSections([section]) - section.start : 0;

    return (
        <LyricsContainer shouldBlink={shouldBlink} bottom={bottom}>
            {hasNotes ? (
                <>
                    <LyricsLine>
                        <HeadstartContainer>
                            <Headstart
                                percent={Math.min(2, (currentBeat - section.start) / beatsBetweenSectionAndNote)}
                            />
                        </HeadstartContainer>
                        {section?.notes.map((note) => {
                            const fill = effectsEnabled
                                ? Math.max(0, Math.min(2, (currentBeat - note.start) / note.length))
                                : currentBeat >= note.start
                                ? 1
                                : 0;
                            return (
                                <LyricContainer type={note.type} key={note.start}>
                                    <LyricActiveContainer>
                                        <LyricActive fill={fill}>{note.lyrics.trim()}</LyricActive>
                                        {note.lyrics.endsWith(' ') && ' '}
                                    </LyricActiveContainer>
                                    {note.lyrics}
                                </LyricContainer>
                            );
                        })}
                    </LyricsLine>
                </>
            ) : (
                <LyricsLine>&nbsp;</LyricsLine>
            )}
            {isNotesSection(nextSection) && (
                <LyricsLine secondLine>
                    {nextSection?.notes.map((note) => (
                        <Fragment key={note.start}>{note.lyrics}</Fragment>
                    ))}
                </LyricsLine>
            )}
        </LyricsContainer>
    );
}

const HeadstartContainer = styled.span`
    position: relative;
    height: 0;
`;

const Headstart = styled.span.attrs<{ percent: number }>((props) => ({
    style: {
        right: `${Math.max(0, 1 - props.percent) * 150}px`,
        width: `${Math.min(1, 2 - props.percent) * 150}px`,
    },
}))<{ percent: number }>`
    position: absolute;
    width: 100px;
    height: 31px;
    margin: 7px 0;
    right: 100px;
    background: linear-gradient(270deg, rgba(255, 165, 0, 1) 0%, rgba(255, 165, 0, 0.5) 25%, rgba(255, 165, 0, 0) 100%);
`;

const LyricContainer = styled.span<{ type: string }>`
    font-style: ${(props) => (props.type === 'freestyle' ? 'italic' : 'normal')};
    position: relative;
`;

const LyricActiveContainer = styled.span`
    position: absolute;
    z-index: 1;
`;
const LyricActive = styled.span.attrs<{ fill: number }>((props) => ({
    style: {
        clipPath: `inset(0 ${(1 - (props.fill === 0 ? 0 : props.fill + 0.05)) * 100}% -50px 0)`,
    },
}))<{ fill: number }>`
    color: ${styles.colors.text.active};
`;

const LyricsContainer = styled.div<{ shouldBlink: boolean; bottom: boolean }>`
    @keyframes blink {
        100% {
            background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
        30% {
            background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
        50% {
            background-color: rgba(134, 134, 134, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
        30% {
            background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
        0% {
            background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
    }

    box-sizing: border-box;
    padding: 10px;
    background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.8' : '0.5')});
    height: 100px;
    width: 100%;
    text-align: center;
    line-height: 1;
    ${(props) => (props.shouldBlink ? `animation: blink 500ms ease-in-out infinite both;` : ``)}
`;

const LyricsLine = styled.div<{ secondLine?: boolean }>`
    font-size: ${({ secondLine }) => 35 + (secondLine ? 0 : 10)}px;
    height: 45px;
    color: ${({ secondLine }) => (secondLine ? styles.colors.text.inactive : styles.colors.text.default)};

    font-family: 'Comic Sans MS', 'Comic Sans';
`;

export default Lyrics;
