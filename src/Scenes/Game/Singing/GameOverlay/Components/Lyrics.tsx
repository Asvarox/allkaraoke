import styled from '@emotion/styled';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { ComponentProps, Fragment, PropsWithChildren } from 'react';
import GameState from '../../GameState/GameState';
import isNotesSection from '../../Helpers/isNotesSection';
import { getFirstNoteStartFromSections } from '../../Helpers/notesSelectors';
import styles from '../Drawing/styles';

interface Props {
    player: number;
    bottom?: boolean;
    playerChanges: number[][];
    effectsEnabled: boolean;
}

function Lyrics({ player, playerChanges, bottom = false, effectsEnabled }: Props) {
    const playerColor = styles.colors.players[player].text;
    const thisPlayerChanges = playerChanges[GameState.getPlayer(player).getTrackIndex()] ?? [];
    const section = GameState.getPlayer(player).getCurrentSection();
    const nextSection = GameState.getPlayer(player).getNextSection();
    const subsequentSection = GameState.getPlayer(player).getNextSection(2);
    const currentBeat = GameState.getCurrentBeat();
    const beatLength = GameState.getSongBeatLength();

    const previousChange = Math.max(0, ...thisPlayerChanges.filter((beat) => beat <= section?.start ?? -Infinity));
    const nextChange = thisPlayerChanges.find((beat) => beat > section?.start ?? Infinity) ?? Infinity;
    const timeToNextChange = (nextChange - currentBeat) * beatLength;

    const passTheMicProgress = (nextChange - currentBeat) / (nextChange - previousChange);

    const shouldBlink = timeToNextChange < 2500;

    const hasNotes = isNotesSection(section);

    const beatsBetweenSectionAndNote = hasNotes ? getFirstNoteStartFromSections([section]) - section.start : 0;

    return (
        <LyricsContainer shouldBlink={shouldBlink} bottom={bottom}>
            {timeToNextChange < Infinity && (
                <PassTheMicProgress
                    color={playerColor}
                    progress={passTheMicProgress <= 1 ? passTheMicProgress * 100 : 0}
                />
            )}
            {hasNotes ? (
                <>
                    <LyricsLine data-test={`lyrics-line-player-${player}`}>
                        <HeadstartContainer>
                            <Headstart
                                color={playerColor}
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
                                        <LyricActive fill={fill} color={playerColor}>
                                            {note.lyrics.trim()}
                                        </LyricActive>
                                        {note.lyrics.endsWith(' ') && ' '}
                                    </LyricActiveContainer>
                                    {note.lyrics}
                                </LyricContainer>
                            );
                        })}
                        {nextSection?.start === nextChange && <PassTheMicSymbol shouldShake />}
                    </LyricsLine>
                </>
            ) : (
                <LyricsLine>&nbsp;</LyricsLine>
            )}
            {isNotesSection(nextSection) && (
                <LyricsLine secondLine>
                    {nextSection.notes.map((note) => (
                        <Fragment key={note.start}>{note.lyrics}</Fragment>
                    ))}
                    {subsequentSection?.start === nextChange && <PassTheMicSymbol />}
                </LyricsLine>
            )}
        </LyricsContainer>
    );
}

const HeadstartContainer = styled.span`
    position: relative;
    height: 0;
`;

const BaseHeadstart = styled.span`
    position: absolute;
    width: 100px;
    height: 31px;
    margin: 7px 0;
    right: 100px;
`;

const Headstart = ({ percent, color }: { percent: number; color: string }) => (
    <BaseHeadstart
        style={{
            right: `${Math.max(0, 1 - percent) * 150}px`,
            width: `${Math.min(1, 2 - percent) * 150}px`,
            background: `linear-gradient(270deg, rgba(${color}, 1) 0%, rgba(${color}, 0.5) 25%, rgba(${color}, 0) 100%)`,
        }}
    />
);

const LyricContainer = styled.span<{ type: string }>`
    font-style: ${(props) => (props.type === 'freestyle' ? 'italic' : 'normal')};
    position: relative;
`;

const LyricActiveContainer = styled.span`
    position: absolute;
    z-index: 1;
`;
const BaseLyricActive = styled.span``;

const LyricActive = ({ fill, color, children }: PropsWithChildren<{ fill: number; color: string }>) => (
    <BaseLyricActive
        style={{
            clipPath: `inset(0 ${(1 - (fill === 0 ? 0 : fill + 0.05)) * 100}% -50px 0)`,
            color: `rgb(${color})`,
        }}>
        {children}
    </BaseLyricActive>
);

const LyricsContainer = styled.div<{ shouldBlink: boolean; bottom: boolean }>`
    @keyframes blink {
        100% {
            background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
        30% {
            background-color: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.85' : '0.5')});
        }
        50% {
            background-color: rgba(200, 200, 200, ${(props) => (props.bottom ? '0.85' : '0.5')});
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
    margin: 20px 0;
    ${(props) => (props.shouldBlink ? `animation: blink 350ms ease-in-out infinite both;` : ``)}
`;

const BasePassTheMicProgress = styled.div<{ color: string }>`
    position: absolute;
    height: 10px;
    background: rgb(${(props) => props.color});
    transition: 50ms;
`;

const PassTheMicProgress = (props: { progress: number } & ComponentProps<typeof BasePassTheMicProgress>) => (
    <BasePassTheMicProgress style={{ width: `${props.progress}%` }} color={props.color} />
);

const PassTheMicSymbol = styled(SwapHorizIcon, { shouldForwardProp: (prop) => prop !== 'shouldShake' })<{
    shouldShake?: boolean;
}>`
    @keyframes shake {
        10%,
        90% {
            transform: translate3d(-1px, 0, 0);
        }

        20%,
        80% {
            transform: translate3d(2px, 0, 0);
        }

        30%,
        50%,
        70% {
            transform: translate3d(-4px, 0, 0);
        }

        40%,
        60% {
            transform: translate3d(4px, 0, 0);
        }
    }

    ${(props) => props.shouldShake && 'animation: shake 0.92s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;'}
    margin-left: 20px;
    ${(props) => (props.shouldShake ? `fill: ${styles.colors.text.active};` : '')}
    font-size: ${(props) => (props.shouldShake ? 40 : 30)}px;
`;
const LyricsLine = styled.div<{ secondLine?: boolean }>`
    font-size: ${({ secondLine }) => 35 + (secondLine ? 0 : 10)}px;
    height: 45px;
    color: ${({ secondLine }) => (secondLine ? styles.colors.text.inactive : styles.colors.text.default)};

    font-family: 'Comic Sans MS', 'Comic Sans';
`;

export default Lyrics;
