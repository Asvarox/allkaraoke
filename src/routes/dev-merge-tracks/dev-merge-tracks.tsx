import { useEffect, useState } from 'react';

import { NotesSection, Song, SongTrack } from '~/interfaces';
import { useBackground } from '~/modules/elements/background-context';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import getSongBeatLength from '~/modules/songs/utils/get-song-beat-length';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import mergeTracks from '~/modules/songs/utils/merge-tracks';
import { getLastNoteEnd } from '~/modules/songs/utils/notes-selectors';
import isDev from '~/modules/utils/is-dev';

import legacyMergeTracks from './legacy-merge-tracks';

const SONGS = [
  { id: 'linkin-park-heavy-is-the-crown', label: 'Heavy Is the Crown' },
  { id: 'stachursky-dosko', label: 'Dosko' },
  { id: 'edyta-gorniak-mietek-szczesniak-dumka-na-dwa-serca', label: 'Dumka na dwa serca' },
  { id: 'disneys-the-lion-king-hakuna-matata', label: 'Hakuna Matata' },
  { id: 'linkin-park-in-the-end', label: 'In the End' },
  { id: 'queen-bohemian-rhapsody', label: 'Bohemian Rhapsody' },
];

type Origin = 0 | 1 | 'both';
type Status = 'same' | 'added' | 'trimmed' | 'other-copy' | 'removed';

interface Line {
  section: NotesSection;
  origin: Origin;
  start: number;
  end: number;
  trimmedBy: number;
}

interface Row {
  key: string;
  start: number;
  before?: Line;
  after?: Line;
}

const lyricsOf = (section: NotesSection) => section.notes.map((note) => note.lyrics).join('');
const notesSections = (track: SongTrack) => track.sections.filter(isNotesSection);

const findSource = (track: SongTrack, section: NotesSection) =>
  notesSections(track).find(
    (source) => source.notes[0].start === section.notes[0].start && source.notes[0].lyrics === section.notes[0].lyrics,
  );

const toLines = (song: Song, merged: SongTrack): Line[] =>
  notesSections(merged).map((section) => {
    const sources = song.tracks.map((track) => findSource(track, section));
    const shared = sources[0] && sources[1] && lyricsOf(sources[0]) === lyricsOf(sources[1]);
    // A shared line can come from either track's copy - the one it was least trimmed from is the source
    const trims = sources.map((source) => (source ? getLastNoteEnd(source) - getLastNoteEnd(section) : Infinity));
    const index = trims[1] >= 0 && trims[1] < trims[0] ? 1 : 0;
    return {
      section,
      origin: shared ? 'both' : (index as 0 | 1),
      start: section.notes[0].start,
      end: getLastNoteEnd(section),
      trimmedBy: Number.isFinite(trims[index]) ? trims[index] : 0,
    };
  });

const lineKey = (line: Line) => `${line.start}:${line.section.notes[0].lyrics}`;

const buildRows = (before: Line[], after: Line[]): Row[] => {
  const rows = new Map<string, Row>();
  before.forEach((line) => rows.set(lineKey(line), { key: lineKey(line), start: line.start, before: line }));
  after.forEach((line) => {
    const row = rows.get(lineKey(line)) ?? { key: lineKey(line), start: line.start };
    rows.set(lineKey(line), { ...row, after: line });
  });
  return [...rows.values()].sort((a, b) => a.start - b.start);
};

const rowStatus = (row: Row): Status => {
  if (!row.after) return 'removed';
  if (!row.before) return 'added';
  if (row.after.trimmedBy > 0) return 'trimmed';
  if (row.after.end !== row.before.end) return 'other-copy';
  return 'same';
};

const ORIGIN_STYLES: Record<string, { bar: string; fill: string; label: string }> = {
  '0': { bar: 'border-l-sky-400', fill: '#38bdf8', label: 'P1' },
  '1': { bar: 'border-l-pink-400', fill: '#f472b6', label: 'P2' },
  both: { bar: 'border-l-violet-400', fill: '#a78bfa', label: 'Both' },
};

const STATUS_STYLES: Record<Status, { row: string; chip: string; label: string }> = {
  same: { row: '', chip: '', label: '' },
  added: { row: 'bg-green-500/10', chip: 'bg-green-500/20 text-green-300', label: 'restored' },
  trimmed: { row: 'bg-amber-500/10', chip: 'bg-amber-500/20 text-amber-300', label: 'trimmed' },
  removed: { row: 'bg-red-500/10', chip: 'bg-red-500/20 text-red-300', label: 'dropped' },
  'other-copy': { row: 'bg-sky-500/10', chip: 'bg-sky-500/20 text-sky-300', label: 'other copy' },
};

interface Comparison {
  song: Song;
  rows: Row[];
  lanes: { label: string; lines: Pick<Line, 'start' | 'end' | 'origin'>[] }[];
  duration: number;
}

const compare = (song: Song): Comparison => {
  const before = toLines(song, legacyMergeTracks(song.tracks, song)!);
  const after = toLines(song, mergeTracks(song.tracks, song)!);
  const trackLines = (index: 0 | 1) =>
    notesSections(song.tracks[index]).map((s) => ({ start: s.notes[0].start, end: getLastNoteEnd(s), origin: index }));

  return {
    song,
    rows: buildRows(before, after),
    lanes: [
      { label: 'P1', lines: trackLines(0) },
      { label: 'P2', lines: trackLines(1) },
      { label: 'Before', lines: before },
      { label: 'After', lines: after },
    ],
    duration: Math.max(...song.tracks.flatMap((track) => notesSections(track).map(getLastNoteEnd))),
  };
};

function useComparison(songId: string) {
  const [state, setState] = useState<{ id: string; comparison?: Comparison; error?: string }>({ id: songId });

  useEffect(() => {
    let cancelled = false;
    fetch(`/songs/${songId}.txt`)
      .then((response) => response.text())
      .then((txt) => !cancelled && setState({ id: songId, comparison: compare(convertTxtToSong(txt)) }))
      .catch((error: unknown) => !cancelled && setState({ id: songId, error: String(error) }));
    return () => {
      cancelled = true;
    };
  }, [songId]);

  return state.id === songId ? state : { id: songId };
}

const formatTime = (song: Song, beat: number) => {
  const ms = song.gap + beat * getSongBeatLength(song);
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

function Timeline({ comparison, onSelect }: { comparison: Comparison; onSelect: (beat: number) => void }) {
  const { lanes, duration } = comparison;
  const laneHeight = 14;
  const gap = 6;

  return (
    <div className="grid grid-cols-[3.5rem_1fr] items-center gap-x-2 gap-y-1.5">
      {lanes.map((lane) => (
        <div key={lane.label} className="contents">
          <span className="text-right text-xs text-neutral-400">{lane.label}</span>
          <svg
            viewBox={`0 0 ${duration} ${laneHeight}`}
            preserveAspectRatio="none"
            className="h-3.5 w-full cursor-pointer rounded-sm bg-neutral-800"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              onSelect(((event.clientX - rect.left) / rect.width) * duration);
            }}>
            {lane.lines.map((line) => (
              <rect
                key={`${line.start}-${line.end}`}
                x={line.start}
                width={Math.max(1, line.end - line.start - gap / 4)}
                y={0}
                height={laneHeight}
                fill={ORIGIN_STYLES[String(line.origin)].fill}
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}

function LineCell({ line, status }: { line?: Line; status: Status }) {
  if (!line) return <div className="rounded px-3 py-1.5 text-sm text-neutral-600 italic">—</div>;
  const origin = ORIGIN_STYLES[String(line.origin)];
  const dimmed = status === 'removed';

  return (
    <div className={`flex items-start gap-2 rounded border-l-4 bg-neutral-800/60 px-3 py-1.5 ${origin.bar}`}>
      <span className="w-9 shrink-0 pt-0.5 text-[10px] font-semibold text-neutral-400 uppercase">{origin.label}</span>
      <span className={`text-sm ${dimmed ? 'text-neutral-400 line-through' : ''}`}>
        {line.section.notes.map((note, index) => (
          <span key={index} className={note.type === 'star' ? 'text-amber-300' : ''}>
            {note.lyrics}
          </span>
        ))}
        {line.trimmedBy > 0 && <span className="ml-1 text-xs text-amber-300">(−{line.trimmedBy} beats)</span>}
      </span>
    </div>
  );
}

const songIdFromHash = () => {
  const fromHash = window.location.hash.slice(1);
  return SONGS.some((song) => song.id === fromHash) ? fromHash : SONGS[0].id;
};

function DevMergeTracks() {
  useBackground(false);
  const [songId, setSongId] = useState(songIdFromHash);
  useEffect(() => {
    const onHashChange = () => setSongId(songIdFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [onlyChanges, setOnlyChanges] = useState(false);
  const { comparison, error } = useComparison(songId);

  if (!isDev()) return null;

  const selectSong = (id: string) => {
    window.location.hash = id;
  };

  const scrollToBeat = (beat: number) => {
    const row = comparison?.rows.find((r) => (r.after ?? r.before)!.end >= beat);
    if (row) document.getElementById(`row-${row.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const rows = comparison?.rows ?? [];
  const changedCount = rows.filter((row) => rowStatus(row) !== 'same').length;
  const visibleRows = onlyChanges
    ? rows.filter((_, i) => rows.slice(Math.max(0, i - 1), i + 2).some((row) => rowStatus(row) !== 'same'))
    : rows;

  return (
    <div className="text-default min-h-screen bg-neutral-900 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-bold">Duet merge preview</h1>
        <p className="mb-4 text-sm text-neutral-400">
          How the two duet tracks are merged into the single track used when the duet is not sung by exactly two
          players. Before = previous algorithm, after = current one.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {SONGS.map((song) => (
            <button
              key={song.id}
              onClick={() => selectSong(song.id)}
              className={`rounded border px-3 py-1 text-sm ${
                song.id === songId
                  ? 'border-blue-400 bg-blue-950 text-blue-300'
                  : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
              }`}>
              {song.label}
            </button>
          ))}
        </div>

        {error && <p className="text-danger">{error}</p>}
        {!comparison && !error && <p className="text-neutral-400">Loading…</p>}

        {comparison && (
          <>
            <div className="sticky top-0 z-10 -mx-4 mb-4 bg-neutral-900/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="font-semibold">
                  {comparison.song.artist} – {comparison.song.title}
                </span>
                <span className="text-neutral-400">{changedCount} lines changed</span>
                <label className="ml-auto flex cursor-pointer items-center gap-2 text-neutral-300">
                  <input type="checkbox" checked={onlyChanges} onChange={(e) => setOnlyChanges(e.target.checked)} />
                  Only changes
                </label>
              </div>
              <Timeline comparison={comparison} onSelect={scrollToBeat} />
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                {Object.values(ORIGIN_STYLES).map((style) => (
                  <span key={style.label} className="flex items-center gap-1">
                    <span className="inline-block size-2.5 rounded-sm" style={{ background: style.fill }} />
                    {style.label}
                  </span>
                ))}
                <span>· click the timeline to jump</span>
              </div>
            </div>

            <div className="grid grid-cols-[3rem_1fr_1fr] gap-x-2 gap-y-1 sm:grid-cols-[3.5rem_1fr_1fr]">
              <span />
              <span className="text-xs font-semibold text-neutral-400 uppercase">Before</span>
              <span className="text-xs font-semibold text-neutral-400 uppercase">After</span>
              {visibleRows.map((row) => {
                const status = rowStatus(row);
                const style = STATUS_STYLES[status];
                return (
                  <div key={row.key} className="contents">
                    <div
                      id={`row-${row.key}`}
                      className={`flex scroll-mt-48 flex-col items-end gap-1 rounded-l py-1.5 pr-1 ${style.row}`}>
                      <span className="text-xs text-neutral-500 tabular-nums">
                        {formatTime(comparison.song, row.start)}
                      </span>
                      {style.label && (
                        <span className={`rounded px-1 text-[9px] font-semibold uppercase ${style.chip}`}>
                          {style.label}
                        </span>
                      )}
                    </div>
                    <div className={style.row}>
                      <LineCell line={row.before} status={status} />
                    </div>
                    <div className={`rounded-r ${style.row}`}>
                      <LineCell line={row.after} status="same" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DevMergeTracks;
