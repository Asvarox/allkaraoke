import { uniq } from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Song } from '../../../../interfaces';
import styles from '../Drawing/styles';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from '../Helpers/notesSelectors';

interface Props {
    song: Song;
    currentTime: number;
    duration: number;
    beatLength: number;
    usedTracks: number[];
}

function DurationBar({ song, currentTime, duration, beatLength, usedTracks }: Props) {
    const firstNotes = useMemo(
        () =>
            uniq(
                song.tracks
                    .filter((v, index) => usedTracks.includes(index))
                    .map(({ sections }) => getFirstNoteStartFromSections(sections) * beatLength + song.gap),
            ),
        [song, beatLength, usedTracks],
    );
    const lastNotes = useMemo(
        () =>
            uniq(
                song.tracks
                    .filter((v, index) => usedTracks.includes(index))
                    .map(({ sections }) => getLastNoteEndFromSections(sections) * beatLength + song.gap),
            ),
        [song, beatLength, usedTracks],
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
    height: 6px;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    left: 0;
    top: calc(50% - 3px);
`;

const Marker = styled(Bar).attrs<{ position: number }>((props) => ({
    style: {
        left: `${Math.min(props.position * 100, 100)}%`,
    },
}))<{ position: number }>`
    top: 0;
    margin-left: -3px;
    width: 6px;
    background: ${styles.colors.text.active};
    opacity: 75%;
`;

const BarFill = styled(Bar).attrs<{ fill: number }>(({ fill }) => ({
    style: {
        width: `${Math.round(fill * 10000) / 100}%`,
    },
}))<{ fill: number }>`
    top: 0;
    background: white;
    opacity: 50%;
`;

export default DurationBar;
