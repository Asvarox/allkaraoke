import { Fragment } from 'react';
import styled from 'styled-components';
import { Section } from '../../../../interfaces';
import styles from '../Drawing/styles';
import isNotesSection from '../Helpers/isNotesSection';

interface Props {
    section: Section,
    nextSection?: Section;
    bottom?: boolean;
    playerChanges: number[],
    currentBeat: number,
    beatLength: number,
}

function Lyrics({ section, nextSection, currentBeat, playerChanges, bottom = false, beatLength }: Props) {
    const nextChange = playerChanges.find(beat => beat > section?.start ?? Infinity);
    const shouldBlink = (
        !!nextChange &&
        nextChange * beatLength - 2500 < currentBeat * beatLength
    );
            
    return (
        <LyricsContainer shouldBlink={shouldBlink} bottom={bottom}>
            {isNotesSection(section) ? (<LyricsLine>
                {section?.notes.map((note) => {
                    return (
                    <LyricContainer type={note.type} key={note.start}>
                        <LyricActiveContainer>
                            <LyricActive fill={Math.max(0, Math.min(1, (currentBeat - note.start) / note.length))}>
                                {note.lyrics.trim()}
                            </LyricActive>
                            {note.lyrics.endsWith(' ') && ' '}
                        </LyricActiveContainer>
                        {note.lyrics}
                    </LyricContainer>
)})}
            </LyricsLine>
            ) : <LyricsLine>&nbsp;</LyricsLine>}
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

const LyricContainer = styled.span<{ type: string }>`
    font-style: ${props => props.type === 'freestyle' ? 'italic' : 'normal'};
    position: relative;
`;

const LyricActiveContainer = styled.span`
    position: absolute;
    z-index: 1;
`
const LyricActive = styled.span.attrs<{ fill: number }>(props => ({ style: {
    clipPath: `inset(0 ${(1 - (props.fill === 0 ? 0 : props.fill + .05)) * 100}% -50px 0)`,
}}))<{ fill: number }>`
    color: ${styles.colors.text.active};
`;


const LyricsContainer = styled.div<{ shouldBlink: boolean, bottom: boolean }>`
    @keyframes blink {
        100% {
            background-color: rgba(0, 0, 0, ${props => props.bottom ? '0.85' : '0.5' });
        }
        30% {
            background-color: rgba(0, 0, 0, ${props => props.bottom ? '0.85' : '0.5' });
        }
        50% {
            background-color: rgba(134, 134, 134, ${props => props.bottom ? '0.85' : '0.5' });
        }
        30% {
            background-color: rgba(0, 0, 0, ${props => props.bottom ? '0.85' : '0.5' });
        }
        0% {
            background-color: rgba(0, 0, 0, ${props => props.bottom ? '0.85' : '0.5' });
        }
    }

    box-sizing: border-box;
    padding: 10px;
    background-color: rgba(0, 0, 0, ${props => props.bottom ? '0.8' : '0.5'});
    height: 100px;
    width: 100%;
    text-align: center;
    line-height: 1;
    ${props => props.shouldBlink ? `animation: blink 500ms ease-in-out infinite both;` : ``}
`;

const LyricsLine = styled.div<{ secondLine?: boolean }>`
    font-size: ${({ secondLine }) => 35 + (secondLine ? 0 : 10)}px;
    height: 45px;
    color: ${({ secondLine }) => secondLine ? styles.colors.text.inactive : styles.colors.text.default};

    font-family: "Comic Sans MS", "Comic Sans";
`;

export default Lyrics;
