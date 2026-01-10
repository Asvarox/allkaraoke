import { NotesSection, songBeat } from 'interfaces';
import styles from 'modules/GameEngine/Drawing/styles';
import GameState from 'modules/GameEngine/GameState/GameState';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import { getFirstNoteStartFromSections } from 'modules/Songs/utils/notesSelectors';
import { motion } from 'motion/react';
import { Fragment } from 'react';
import AnimatedLine from './AnimatedLine';
import Headstart from './Headstart';
import LyricNoteToken from './LyricNoteToken';
import LyricsLine from './LyricsLine';
import LyricsVolumeIndicators from './LyricsVolumeIndicators';
import { PassTheMicProgress, PassTheMicSymbol } from './PassTheMic';
import { LyricsProps } from './types';
import { getHeadstartPercent, getPassTheMicUiState } from './utils';

function PassTheMicProgressBar({ color, progressPercent }: { color: string; progressPercent: number }) {
  return <PassTheMicProgress color={color} progress={progressPercent} />;
}

function CurrentLyricsLine(props: {
  playerNumber: number;
  section: NotesSection | null;
  currentBeat: songBeat;
  playerColor: string;
  headstartPercent: number;
  effectsEnabled: boolean;
  showSwap: boolean;
}) {
  return (
    <LyricsLine layout effectsEnabled={props.effectsEnabled} data-test={`lyrics-current-player-${props.playerNumber}`}>
      <AnimatedLine
        motionKey={String(props.section?.start ?? 'no-section')}
        effectsEnabled={props.effectsEnabled}
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.9,
        }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.9,
        }}>
        {props.section ? (
          <>
            <span className="relative h-0">
              <Headstart color={props.playerColor} percent={props.headstartPercent} />
            </span>
            <span>
              {props.section.notes.map((note) => (
                <LyricNoteToken
                  key={note.start}
                  note={note}
                  currentBeat={props.currentBeat}
                  playerColor={props.playerColor}
                />
              ))}
              {props.showSwap && <PassTheMicSymbol shouldShake />}
            </span>
          </>
        ) : (
          <>&nbsp;</>
        )}
      </AnimatedLine>
    </LyricsLine>
  );
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
  const playerState = GameState.getPlayer(player.number)!;
  const playerColor = styles.colors.players[player.number].text;
  const section = playerState.getCurrentSection();
  const nextSection = playerState.getNextSection();
  const subsequentSection = playerState.getNextSection(2);
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

  // todo these calculations should be inside Headstart component
  const beatsBetweenSectionAndNote = currentNotesSection
    ? getFirstNoteStartFromSections([currentNotesSection]) - currentNotesSection.start
    : 0;
  const headstartPercent = currentNotesSection
    ? getHeadstartPercent(currentBeat, currentNotesSection.start, beatsBetweenSectionAndNote)
    : 2;

  const baseBackground = bottom ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)';
  const blinkDark = bottom ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)';
  const blinkLight = bottom ? 'rgba(200,200,200,0.85)' : 'rgba(200,200,200,0.5)';

  return (
    <motion.div
      className="box-border w-full p-3 text-center leading-none"
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
        headstartPercent={headstartPercent}
        effectsEnabled={effectsEnabled}
        showSwap={passTheMicUi.showSwapOnCurrentLine}
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
