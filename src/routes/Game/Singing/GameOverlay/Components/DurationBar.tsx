import { uniq } from 'es-toolkit';
import type { Ref } from 'react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { PlayerSetup } from '~/interfaces';
import { VideoState } from '~/modules/Elements/VideoPlayer';
import styles from '~/modules/GameEngine/Drawing/styles';
import GameState from '~/modules/GameEngine/GameState/GameState';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from '~/modules/Songs/utils/notesSelectors';

interface Props {
  players: PlayerSetup[];
  currentStatus: VideoState;
  duration: number;
}

function DurationBar({ players, duration }: Props) {
  const barFillRef = useRef<HTMLDivElement>(null);
  const beatLength = GameState.getSongBeatLength();
  const song = GameState.getSong()!;

  const firstNotes = useMemo(
    () =>
      uniq(
        song.tracks
          .filter((_, index) => players.find((player) => player.track === index))
          .map(({ sections }) => getFirstNoteStartFromSections(sections) * beatLength + song.gap),
      ),
    [song, beatLength, players],
  );
  const lastNotes = useMemo(
    () =>
      uniq(
        song.tracks
          .filter((_, index) => players.find((player) => player.track === index))
          .map(({ sections }) => getLastNoteEndFromSections(sections) * beatLength + song.gap),
      ),
    [song, beatLength, players],
  );

  const durationMs = duration * 1000;

  useEffect(() => {
    const updateBarFill = () => {
      if (!duration || !barFillRef.current) return;

      const currentTime = GameState.getCurrentTime(false);
      if (currentTime && barFillRef.current) {
        const fillPercentage = Math.round((currentTime / durationMs) * 10_000) / 100;
        barFillRef.current.style.transform = `scaleX(${fillPercentage / 100})`;
      }
    };

    const interval = setInterval(updateBarFill, 50); // ~60fps

    return () => clearInterval(interval);
  }, [duration, durationMs]);

  if (!duration) return null;

  return (
    <div className="absolute top-1/2 left-0 h-2.5 w-full -translate-y-1/2 bg-black/50">
      {firstNotes.map((note) => (
        <Marker key={note} position={note / durationMs} />
      ))}
      {lastNotes.map((note) => (
        <Marker key={note} position={note / durationMs} />
      ))}
      <BarFill ref={barFillRef} />
    </div>
  );
}

const Marker = (props: { position: number }) => (
  <div
    className="absolute top-0 -ml-1 h-full w-2 opacity-75"
    style={{
      left: `${Math.min(props.position * 100, 100)}%`,
      backgroundColor: styles.colors.text.active,
    }}
  />
);

const BarFill = ({ ref }: { ref: Ref<HTMLDivElement> }) => (
  <div ref={ref} className="absolute top-0 left-0 h-full w-full origin-left bg-white/50" />
);

export default memo(DurationBar);
