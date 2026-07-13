import { motion } from 'motion/react';
import { Fragment } from 'react';
import { NotesSection } from '~/interfaces';
import styles from '~/modules/game-engine/drawing/styles';
import GameState from '~/modules/game-engine/game-state/game-state';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import { cn } from '~/utils/cn';
import AnimatedLine from './animated-line';
import CurrentLyricsLine from './current-lyrics-line';
import LyricsLine from './lyrics-line';
import LyricsVolumeIndicators from './lyrics-volume-indicators';
import { PassTheMicProgress, PassTheMicSymbol } from './pass-the-mic';
import { LyricsProps } from './types';
import { getPassTheMicUiState } from './utils';

function PassTheMicProgressBar({ color, progressPercent }: { color: string; progressPercent: number }) {
  return <PassTheMicProgress color={color} progress={progressPercent} />;
}

function NextLyricsLine(props: {
  playerNumber: number;
  nextSection: NotesSection | null;
  effectsEnabled: boolean;
  showSwap: boolean;
}) {
  if (!props.effectsEnabled) return null;

  return (
    <LyricsLine nextLine effectsEnabled={props.effectsEnabled} data-test={`lyrics-next-player-${props.playerNumber}`}>
      {props.nextSection ? (
        <AnimatedLine
          motionKey={String(props.nextSection.start)}
          effectsEnabled={props.effectsEnabled}
          initial={{
            opacity: 0,
            y: 15,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -15,
            scale: 1.15,
          }}>
          <span>
            {props.nextSection.notes.map((note) => (
              <Fragment key={note.start}>{note.lyrics}</Fragment>
            ))}
            {props.showSwap && <PassTheMicSymbol />}
          </span>
        </AnimatedLine>
      ) : (
        <>&nbsp;</>
      )}
    </LyricsLine>
  );
}

export default function Lyrics({ player, bottom = false, effectsEnabled, showStatusForAllPlayers }: LyricsProps) {
  'use no memo'; // React Compiler: reads GameState (current beat, section, sing setup) directly during render while receiving the same `player` object reference every tick, so the compiler's auto-memo bails out and the lyrics/pass-the-mic UI never updates.
  const playerState = GameState.getPlayer(player.number)!;
  const playerColor = styles.colors.players[player.number].text;
  const section = playerState.getCurrentSection();
  const nextSection = playerState.getNextSection();
  const subsequentSection = playerState.getNextSection(2);
  const playSessionId = GameState.getSingSetup()?.id;
  const currentBeat = GameState.getCurrentBeat();
  const beatLength = GameState.getSongBeatLength();

  const passTheMicUi = getPassTheMicUiState({
    mode: GameState.getSingSetup()?.mode,
    changes: playerState.getTrack().changes,
    sectionStart: section?.start ?? null,
    nextSectionStart: nextSection?.start ?? null,
    subsequentSectionStart: subsequentSection?.start ?? null,
    currentBeat,
    beatLengthMs: beatLength,
  });

  const currentNotesSection = isNotesSection(section) ? section : null;
  const nextNotesSection = isNotesSection(nextSection) ? nextSection : null;

  const baseBackground = bottom ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)';
  const blinkDark = bottom ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)';
  const blinkLight = bottom ? 'rgba(200,200,200,0.85)' : 'rgba(200,200,200,0.5)';

  return (
    <motion.div
      className={cn(!effectsEnabled ? `h-8` : 'mobile:h-20 h-30', 'box-border w-full p-3 text-center leading-none')}
      style={{ position: 'relative' }}
      data-test={`lyrics-container-player-${player.number}`}
      animate={
        passTheMicUi.shouldBlink
          ? {
              backgroundColor: [blinkDark, blinkDark, blinkLight, blinkDark, blinkDark],
            }
          : { backgroundColor: baseBackground }
      }
      transition={
        passTheMicUi.shouldBlink
          ? { duration: 0.35, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }
          : { duration: 0 }
      }>
      <LyricsVolumeIndicators
        player={player}
        effectsEnabled={effectsEnabled}
        showStatusForAllPlayers={showStatusForAllPlayers}
      />

      {passTheMicUi.showProgressBar && (
        <PassTheMicProgressBar color={playerColor} progressPercent={passTheMicUi.progressPercent} />
      )}

      <CurrentLyricsLine
        playerNumber={player.number}
        section={currentNotesSection}
        currentBeat={currentBeat}
        playerColor={playerColor}
        effectsEnabled={effectsEnabled}
        showSwap={passTheMicUi.showSwapOnCurrentLine}
        playSessionId={playSessionId}
      />

      <NextLyricsLine
        playerNumber={player.number}
        nextSection={nextNotesSection}
        effectsEnabled={effectsEnabled}
        showSwap={passTheMicUi.showSwapOnNextLine}
      />
    </motion.div>
  );
}
