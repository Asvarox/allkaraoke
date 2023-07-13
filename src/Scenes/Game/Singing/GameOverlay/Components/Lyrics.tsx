import styled from '@emotion/styled';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { PlayerEntity } from 'Players/PlayersManager';
import LyricsVolumeIndicator from 'Scenes/Game/Singing/GameOverlay/Components/LyricsVolumeIndicator';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import isNotesSection from 'Songs/utils/isNotesSection';
import { getFirstNoteStartFromSections } from 'Songs/utils/notesSelectors';
import { Note } from 'interfaces';
import { ComponentProps, Fragment, PropsWithChildren } from 'react';
import GameState from '../../GameState/GameState';
import styles from '../Drawing/styles';

interface Props {
    player: PlayerEntity;
    bottom?: boolean;
    playerChanges: number[][];
    effectsEnabled: boolean;
}

function Lyrics({ player, playerChanges, bottom = false, effectsEnabled }: Props) {
    const playerState = GameState.getPlayer(player.number)!;
    const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
    const playerColor = styles.colors.players[player.number].text;
    const thisPlayerChanges = playerChanges[playerState.getTrackIndex()] ?? [];
    const section = playerState.getCurrentSection();
    const nextSection = playerState.getNextSection();
    const subsequentSection = playerState.getNextSection(2);
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
            {!mobilePhoneMode && effectsEnabled && <LyricsVolumeIndicator player={player} />}
            {timeToNextChange < Infinity && (
                <PassTheMicProgress
                    color={playerColor}
                    progress={passTheMicProgress <= 1 ? passTheMicProgress * 100 : 0}
                />
            )}
            {hasNotes ? (
                <>
                    <LyricsLine
                        data-test={`lyrics-current-player-${player.number}`}
                        effectsEnabled={effectsEnabled}
                        mobileMode={!!mobilePhoneMode}>
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
                <LyricsLine effectsEnabled={effectsEnabled} mobileMode={!!mobilePhoneMode}>
                    &nbsp;
                </LyricsLine>
            )}
            {isNotesSection(nextSection) ? (
                <LyricsLine
                    nextLine
                    data-test={`lyrics-next-player-${player.number}`}
                    effectsEnabled={effectsEnabled}
                    mobileMode={!!mobilePhoneMode}>
                    {nextSection.notes.map((note) => (
                        <Fragment key={note.start}>{note.lyrics}</Fragment>
                    ))}
                    {subsequentSection?.start === nextChange && <PassTheMicSymbol />}
                </LyricsLine>
            ) : (
                <LyricsLine effectsEnabled={effectsEnabled} nextLine mobileMode={!!mobilePhoneMode}>
                    &nbsp;
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
    width: 15rem;
    height: 3.1rem;
    margin: 0.7rem 0;
    right: 10rem;
`;

const Headstart = ({ percent, color }: { percent: number; color: string }) => (
    <BaseHeadstart
        style={{
            transformOrigin: 'right',
            transform: `scaleX(${Math.min(1, 2 - percent)})`,
            right: `${Math.max(0, 1 - percent) * 15}rem`,
            background: `linear-gradient(270deg, rgba(${color}, 1) 0%, rgba(${color}, 0.5) 25%, rgba(${color}, 0) 100%)`,
        }}
    />
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

    padding: 1rem;
    background: rgba(0, 0, 0, ${(props) => (props.bottom ? '0.9' : '0.5')});
    width: 100%;
    text-align: center;
    line-height: 1;
    margin: 2rem 0;
    position: relative;
    ${(props) => (props.shouldBlink ? `animation: blink 350ms ease-in-out infinite both;` : ``)}
`;

const LyricContainer = styled.span<{ type: Note['type'] }>`
    font-style: ${(props) => (props.type === 'freestyle' ? 'italic' : 'normal')};
`;

const LyricActiveContainer = styled.span`
    position: absolute;
    z-index: 1;
`;
const BaseLyricActive = styled.span``;

const LyricActive = ({ fill, color, children }: PropsWithChildren<{ fill: number; color: string }>) => (
    <BaseLyricActive
        style={{
            clipPath: `inset(0 ${(1 - (fill === 0 ? 0 : fill + 0.05)) * 100}% -5rem 0)`,
            color: `rgb(${color})`,
        }}>
        {children}
    </BaseLyricActive>
);

const BasePassTheMicProgress = styled.div<{ color: string }>`
    position: absolute;
    height: 1rem;
    background: rgb(${(props) => props.color});
    width: 100%;
`;

const PassTheMicProgress = (props: { progress: number } & ComponentProps<typeof BasePassTheMicProgress>) => (
    <BasePassTheMicProgress
        style={{
            transformOrigin: 'left',
            transform: `scaleX(${props.progress / 100})`,
        }}
        color={props.color}
    />
);

const PassTheMicSymbol = styled(SwapHorizIcon, { shouldForwardProp: (prop) => prop !== 'shouldShake' })<{
    shouldShake?: boolean;
}>`
    @keyframes shake {
        10%,
        90% {
            transform: translate3d(-0.1rem, 0, 0);
        }

        20%,
        80% {
            transform: translate3d(0.2rem, 0, 0);
        }

        30%,
        50%,
        70% {
            transform: translate3d(-0.4rem, 0, 0);
        }

        40%,
        60% {
            transform: translate3d(0.4rem, 0, 0);
        }
    }

    ${(props) => props.shouldShake && 'animation: shake 0.92s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;'}
    margin-left: 2rem;
    ${(props) => (props.shouldShake ? `fill: ${styles.colors.text.active};` : '')}
    font-size: ${(props) => (props.shouldShake ? 4 : 3)}rem;
`;
const LyricsLine = styled.div<{ nextLine?: boolean; effectsEnabled: boolean; mobileMode: boolean }>`
    font-size: ${({ nextLine, effectsEnabled }) => (effectsEnabled ? 3.5 + (nextLine ? 0 : 1) : 2)}rem;
    height: ${({ effectsEnabled }) => (effectsEnabled ? 4.5 : 2)}rem;
    ${({ effectsEnabled }) => (!effectsEnabled ? '-webkit-text-stroke-width: 2px' : '')};
    ${({ mobileMode }) => mobileMode && '-webkit-text-stroke-width: 0px !important'};

    color: ${({ nextLine }) => (nextLine ? styles.colors.text.inactive : styles.colors.text.default)};

    font-family: 'Comic Sans MS', 'Comic Sans';
    z-index: 10;
`;

export default Lyrics;
