import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { RefObject, useEffect, useRef, useState } from 'react';

import { milliseconds, SongPreview } from '~/interfaces';
import { VideoPlayerRef } from '~/modules/elements/video-player/index';
import { loadSongById } from '~/modules/songs/load-song';
import { cn } from '~/utils/cn';

import { findCurrentIndex, getLyricSyllables, getLyricWords, LyricSyllable, LyricWord } from './get-lyric-syllables';

interface Props {
  songPreview: SongPreview;
  player: RefObject<VideoPlayerRef | null>;
  /** The preview video is visible and playing */
  active: boolean;
  /** Video time the player was told to start from, so words sung before it aren't shown */
  playedFrom: milliseconds;
  top: number;
  left: number;
  width: number;
  height: number;
}

// How long the last sung words stay up once the singing stops
const LINGER_MS = 2500;
// How long the previous line stays up once the next one, following without a pause, starts
const NEXT_LINE_HANDOVER_MS = 400;
// Long-sung words start shaking after this long, harder the longer they're sung (like the game's notes)
const SHAKE_AFTER_MS = 1000;
const SHAKE_RAMP_MS_PER_PX = 300;
const SHAKE_MAX_PX = 6;
// After the word, the shake drains at a steady rate, so the fullest shake takes this long to die down
const SHAKE_MAX_FADE_OUT_MS = 500;
const GOLDEN_SHAKE_FACTOR = 1.6;
// Words at least this many letters long appear a syllable at a time
const PROGRESSIVE_WORD_CHARS = 8;
// A rough width of one character (and of the gap between words), to fit as many words as the tile is wide
const CHAR_WIDTH_PX = 12;
// How far up or down the highest and lowest notes of the song sit
const PITCH_OFFSET_PX = 9;

interface LyricsWindow {
  from: number;
  to: number;
}

/**
 * Karaoke lyrics popping out under the focused song tile, right-aligned to it, one word at a time in time
 * with the preview. Each syllable fills up while it is sung, and each word sits higher or lower with its pitch.
 */
export default function PreviewLyrics({ songPreview, player, active, playedFrom, top, left, width, height }: Props) {
  const [words, setWords] = useState<LyricWord[]>([]);
  const [lyricsWindow, setLyricsWindow] = useState<LyricsWindow | null>(null);
  const currentTime = useRef<milliseconds>(0);

  const { id, sourceType, sharedSongId } = songPreview;
  useEffect(() => {
    let cancelled = false;
    loadSongById(id, { sourceType, sharedSongId })
      .then((song) => {
        if (!cancelled && song) setWords(getLyricWords(getLyricSyllables(song)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [id, sourceType, sharedSongId]);

  const maxChars = Math.max(12, Math.floor(width / CHAR_WIDTH_PX));

  useEffect(() => {
    if (!active || !words.length) {
      setLyricsWindow(null);
      return;
    }
    let frame = 0;
    let pending = false;
    let cancelled = false;

    // Still being sung, or sung only a moment ago, since the video started playing
    const isShown = (word: LyricWord, timeMs: milliseconds) =>
      word.endMs > playedFrom && word.endMs + LINGER_MS >= timeMs;
    // A line that follows straight on (no pause) pushes the previous one out shortly after it starts
    const lineReplaced = (word: LyricWord, timeMs: milliseconds) =>
      word.lineStart && !word.afterPause && word.startMs + NEXT_LINE_HANDOVER_MS < timeMs;

    const update = (timeMs: milliseconds) => {
      currentTime.current = timeMs;
      const to = findCurrentIndex(words, timeMs);
      if (to < 0 || !isShown(words[to], timeMs)) {
        setLyricsWindow(null);
        return;
      }
      // Walk back from the newest word for as many as fit, but not past the silence before a line
      let from = to;
      let chars = wordLength(words[to]);
      while (from > 0) {
        const previous = words[from - 1];
        chars += wordLength(previous) + 1;
        if (chars > maxChars || !isShown(previous, timeMs) || lineReplaced(words[from], timeMs)) break;
        from--;
      }
      setLyricsWindow((current) => (current?.from === from && current.to === to ? current : { from, to }));
    };

    const tick = () => {
      if (!pending && player.current) {
        pending = true;
        player.current
          .getCurrentTime()
          .then((seconds) => {
            if (!cancelled) update(seconds * 1000);
          })
          .catch(() => undefined)
          .finally(() => {
            pending = false;
          });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [active, words, player, maxChars, playedFrom]);

  const visible = lyricsWindow ? words.slice(lyricsWindow.from, lyricsWindow.to + 1) : [];
  const pitches = words.map((word) => word.pitch);
  const minPitch = Math.min(...pitches);
  const pitchRange = Math.max(1, Math.max(...pitches) - minPitch);
  const pitchOffset = (pitch: number) => -((pitch - minPitch) / pitchRange - 0.5) * 2 * PITCH_OFFSET_PX;

  return (
    <div
      aria-hidden
      className="text-md pointer-events-none absolute z-4 flex items-center justify-end gap-x-[0.3em] overflow-visible sm:text-lg"
      style={{ top: top + height - 4, left, width }}>
      {/* A word growing a syllable at a time slides the others along with it */}
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((word, i) => (
            <Word
              key={word.index}
              word={word}
              newLine={word.lineStart && i > 0}
              offsetY={pitchOffset(word.pitch)}
              currentTime={currentTime}
            />
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

const wordLength = (word: LyricWord) => word.syllables.reduce((sum, syllable) => sum + syllable.text.length, 0);

function Word({
  word,
  newLine,
  offsetY,
  currentTime,
}: {
  word: LyricWord;
  /** Starts a lyrics line after others are still up */
  newLine: boolean;
  offsetY: number;
  currentTime: RefObject<milliseconds>;
}) {
  // Read once, so the fill keeps in step with the song however late the word mounted
  const [mountedAt] = useState(() => currentTime.current);
  const tilt = ((word.index * 37) % 7) - 3;
  const isGolden = word.syllables.some((syllable) => syllable.type === 'star' || syllable.type === 'rapstar');
  const shakeRef = useRef<HTMLSpanElement>(null);
  // A long word grows a syllable at a time as it's sung, rather than shoving the line over in one jump
  const progressive = word.syllables.length > 1 && wordLength(word) >= PROGRESSIVE_WORD_CHARS;
  const [revealed, setRevealed] = useState(() =>
    progressive
      ? Math.max(1, word.syllables.filter((syllable) => syllable.startMs <= mountedAt).length)
      : word.syllables.length,
  );

  useEffect(() => {
    if (!progressive) return;
    const timeouts = word.syllables.map((syllable, i) =>
      setTimeout(() => setRevealed((current) => Math.max(current, i + 1)), syllable.startMs - mountedAt),
    );
    return () => timeouts.forEach(clearTimeout);
  }, [progressive, word, mountedAt]);

  // Jitters a new random offset each frame, written straight to the element so it doesn't re-render
  useEffect(() => {
    const duration = word.endMs - word.startMs;
    if (duration <= SHAKE_AFTER_MS) return;
    const startAt = performance.now() + word.startMs - mountedAt;
    let frame = 0;
    const tick = () => {
      const element = shakeRef.current;
      if (!element) return;
      const elapsed = performance.now() - startAt;
      // Builds up while the word is sung, then drains like the game's notes, sooner the less it shook
      const builtUp = Math.min(
        SHAKE_MAX_PX,
        Math.max(0, (Math.min(elapsed, duration) - SHAKE_AFTER_MS) / SHAKE_RAMP_MS_PER_PX),
      );
      const drained = (Math.max(0, elapsed - duration) * SHAKE_MAX_PX) / SHAKE_MAX_FADE_OUT_MS;
      if (elapsed >= duration && builtUp <= drained) {
        element.style.transform = '';
        return;
      }
      const range = Math.max(0, builtUp - drained) * (isGolden ? GOLDEN_SHAKE_FACTOR : 1);
      element.style.transform = range
        ? `translate(${(Math.random() - 0.5) * range}px, ${(Math.random() - 0.5) * range}px)`
        : '';
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [word, mountedAt, isGolden]);

  return (
    <motion.span
      layout="position"
      initial={{ opacity: 0, y: offsetY + 10, scale: 0.75, rotate: tilt * 1.5 }}
      animate={{ opacity: 1, y: offsetY, scale: 1, rotate: tilt * 0.6 }}
      exit={{ opacity: 0, y: offsetY - 8, scale: 0.85, transition: { duration: 0.25, ease: 'easeOut' } }}
      transition={{ type: 'spring', stiffness: 600, damping: 30, mass: 0.6 }}
      className={cn(
        'stroke-text text-inactive inline-block shrink-0 leading-tight font-black whitespace-pre',
        newLine && 'ml-2',
      )}>
      {/* Shakes inside the motion span, whose own transform motion drives */}
      <span ref={shakeRef} className="inline-block">
        {word.syllables.slice(0, revealed).map((syllable, i) => (
          <Syllable key={syllable.index} syllable={syllable} currentTime={currentTime} popIn={progressive && i > 0} />
        ))}
      </span>
    </motion.span>
  );
}

function Syllable({
  syllable,
  currentTime,
  popIn,
}: {
  syllable: LyricSyllable;
  currentTime: RefObject<milliseconds>;
  /** Appears on its own, after the rest of its word */
  popIn: boolean;
}) {
  // The fill's delay counts from this syllable's own mount, which may come after its word's
  const [fillDelay] = useState(() => syllable.startMs - currentTime.current);
  const isGolden = syllable.type === 'star' || syllable.type === 'rapstar';
  const isRap = syllable.type === 'rap' || syllable.type === 'rapstar';

  return (
    <motion.span
      initial={popIn ? { opacity: 0, y: 6, scale: 0.8 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30, mass: 0.6 }}
      className={cn(
        'relative inline-block',
        isGolden
          ? '[text-shadow:0_2px_4px_rgba(0,0,0,0.8),0_0_12px_rgba(253,224,71,0.9)]'
          : '[text-shadow:0_2px_4px_rgba(0,0,0,0.8)]',
        isRap && 'italic',
      )}>
      {syllable.text}
      {/* No shadow of its own: the clip would cut the glow off at its edges, the text below draws it */}
      <span
        className="absolute inset-0 text-white [text-shadow:none]"
        style={{
          animationName: 'lyric-fill',
          animationDuration: `${Math.max(1, syllable.endMs - syllable.startMs)}ms`,
          animationDelay: `${fillDelay}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'both',
        }}>
        {syllable.text}
      </span>
    </motion.span>
  );
}
