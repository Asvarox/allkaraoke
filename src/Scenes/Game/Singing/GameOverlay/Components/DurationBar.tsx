import styled from '@emotion/styled';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from 'Songs/utils/notesSelectors';
import { PlayerSetup } from 'interfaces';
import { uniq } from 'lodash-es';
import { useMemo } from 'react';
import GameState from '../../GameState/GameState';
import styles from '../Drawing/styles';

interface Props {
  players: PlayerSetup[];
}

function DurationBar({ players }: Props) {
  const currentTime = GameState.getCurrentTime(false);
  const beatLength = GameState.getSongBeatLength();
  const duration = GameState.getDuration();
  const song = GameState.getSong()!;

  const firstNotes = useMemo(
    () =>
      uniq(
        song.tracks
          .filter((v, index) => players.find((player) => player.track === index))
          .map(({ sections }) => getFirstNoteStartFromSections(sections) * beatLength + song.gap),
      ),
    [song, beatLength, players],
  );
  const lastNotes = useMemo(
    () =>
      uniq(
        song.tracks
          .filter((v, index) => players.find((player) => player.track === index))
          .map(({ sections }) => getLastNoteEndFromSections(sections) * beatLength + song.gap),
      ),
    [song, beatLength, players],
  );

  const durationMs = duration * 1000;

  if (!currentTime || !duration) return null;

  return (
    <Bar>
      {firstNotes.map((note) => (
        <Marker key={note} position={note / durationMs} />
      ))}
      {lastNotes.map((note) => (
        <Marker key={note} position={note / durationMs} />
      ))}
      <BarFill fill={currentTime / durationMs} />
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
`;

const BarFill = (props: { fill: number }) => (
  <BaseBarFill style={{ width: `${Math.round(props.fill * 10_000) / 100}%` }} />
);

export default DurationBar;
