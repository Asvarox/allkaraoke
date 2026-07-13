import { Fragment, useMemo, useRef } from 'react';
import { NotesSection, songBeat } from '~/interfaces';
import AnimatedLine from './animated-line';
import Headstart from './headstart';
import LyricNoteToken from './lyric-note-token';
import LyricsLine from './lyrics-line';
import { PassTheMicSymbol } from './pass-the-mic';
import { specialLyricWordEffects } from './special-word-effects';
import { hasLyricTrailingSpace } from './utils';
import { findFirstLyricWordEffects, MatchedLyricWordEffect } from './word-effects';

// Set to Infinity to allow each effect only once per song play.
// Change this value later to allow recurring effects every N sections.
const EFFECT_SECTION_COOLDOWN = Number.POSITIVE_INFINITY;

type CurrentLyricsLineProps = {
  playerNumber: number;
  section: NotesSection | null;
  currentBeat: songBeat;
  playerColor: string;
  effectsEnabled: boolean;
  showSwap: boolean;
  playSessionId?: string;
};

type EffectState = {
  playSessionId?: string;
  lastSectionStart: songBeat | null;
  sectionIndex: number;
  activeMatches: MatchedLyricWordEffect[];
  lastShownSectionByEffect: Map<MatchedLyricWordEffect['effect'], number>;
};

export default function CurrentLyricsLine(props: CurrentLyricsLineProps) {
  const emptyEffectState: EffectState = useMemo(
    () => ({
      playSessionId: props.playSessionId,
      lastSectionStart: null,
      sectionIndex: -1,
      activeMatches: [],
      lastShownSectionByEffect: new Map(),
    }),
    [props.playSessionId],
  );

  const sectionEffectsStateRef = useRef<EffectState>(emptyEffectState);

  if (sectionEffectsStateRef.current.playSessionId !== props.playSessionId) {
    sectionEffectsStateRef.current = emptyEffectState;
  }

  const currentSectionStart = props.section?.start ?? null;

  if (sectionEffectsStateRef.current.lastSectionStart !== currentSectionStart) {
    sectionEffectsStateRef.current.lastSectionStart = currentSectionStart;

    if (!props.section) {
      sectionEffectsStateRef.current.activeMatches = [];
    } else {
      sectionEffectsStateRef.current.sectionIndex += 1;

      const rawMatches = findFirstLyricWordEffects(props.section.notes, specialLyricWordEffects);
      const sectionIndex = sectionEffectsStateRef.current.sectionIndex;

      const allowedMatches = rawMatches.filter((match) => {
        const lastShownSectionIndex = sectionEffectsStateRef.current.lastShownSectionByEffect.get(match.effect);

        if (lastShownSectionIndex === undefined) {
          return true;
        }

        return sectionIndex - lastShownSectionIndex >= EFFECT_SECTION_COOLDOWN;
      });

      sectionEffectsStateRef.current.activeMatches = allowedMatches;

      for (const match of allowedMatches) {
        sectionEffectsStateRef.current.lastShownSectionByEffect.set(match.effect, sectionIndex);
      }
    }
  }

  const matchedWordEffects = sectionEffectsStateRef.current.activeMatches;
  const matchesByStartIndex = new Map(matchedWordEffects.map((match) => [match.startIndex, match]));
  const matchedIndices = new Set(matchedWordEffects.flatMap((match) => match.noteIndices));

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
              <Headstart color={props.playerColor} currentBeat={props.currentBeat} section={props.section} />
            </span>
            <span>
              {props.section.notes.map((note, noteIndex) => {
                const matchStartingAtNote = matchesByStartIndex.get(noteIndex);

                if (matchedIndices.has(noteIndex) && !matchStartingAtNote) {
                  return null;
                }

                if (matchStartingAtNote) {
                  const isLastWordNote = matchStartingAtNote.notes.at(-1);

                  return (
                    <Fragment key={note.start}>
                      {matchStartingAtNote.effect.renderWord({
                        notes: matchStartingAtNote.notes,
                        currentBeat: props.currentBeat,
                        playerColor: props.playerColor,
                      })}
                      {isLastWordNote && hasLyricTrailingSpace(isLastWordNote.lyrics) ? <>&nbsp;</> : null}
                    </Fragment>
                  );
                }

                return (
                  <LyricNoteToken
                    key={note.start}
                    note={note}
                    currentBeat={props.currentBeat}
                    playerColor={props.playerColor}
                  />
                );
              })}
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
