import styled from '@emotion/styled';
import { uniq } from 'es-toolkit';
import { PlayerSetup } from 'interfaces';
import { VideoState } from 'modules/Elements/VideoPlayer';
import styles from 'modules/GameEngine/Drawing/styles';
import GameState from 'modules/GameEngine/GameState/GameState';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from 'modules/Songs/utils/notesSelectors';
import { memo, useEffect, useMemo, useRef } from 'react';

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
    <Bar>
      {firstNotes.map((note) => (
        <Marker key={note} position={note / durationMs} />
      ))}
      {lastNotes.map((note) => (
        <Marker key={note} position={note / durationMs} />
      ))}
      <BarFill ref={barFillRef} />
    </Bar>
  );
}

const Bar = styled.div`
  position: absolute;
  height: 0.6rem;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  left: 0;
  top: calc(50% - 0.3rem);
`;

const BaseMarker = styled(Bar)`
  top: 0;
  margin-left: -0.25rem;
  width: 0.5rem;
  background: ${styles.colors.text.active};
  opacity: 75%;
`;

const Marker = (props: { position: number }) => (
  <BaseMarker style={{ left: `${Math.min(props.position * 100, 100)}%` }} />
);

const BaseBarFill = styled(Bar)`
  top: 0;
  background: white;
  opacity: 50%;
  width: 100%;
  transform-origin: left center;
`;

const BarFill = styled(BaseBarFill)``;

export default memo(DurationBar);
