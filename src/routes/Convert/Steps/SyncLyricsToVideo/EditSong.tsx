import { Box, Button, Grid, Typography } from '@mui/material';
import { cloneDeep } from 'es-toolkit';
import { GAME_MODE, milliseconds, Note, seconds, SingSetup, Song } from 'interfaces';
import getCurrentBeat from 'modules/GameEngine/GameState/Helpers/getCurrentBeat';
import getSongBeatLength from 'modules/Songs/utils/getSongBeatLength';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import {
  getFirstNoteFromSection,
  getFirstNoteStartFromSections,
  getLastNotesSection,
  getSectionEnd,
  getSectionStart,
} from 'modules/Songs/utils/notesSelectors';
import addHeadstart from 'modules/Songs/utils/processSong/addHeadstart';
import normaliseGap from 'modules/Songs/utils/processSong/normaliseGap';
import normaliseLyricSpaces from 'modules/Songs/utils/processSong/normaliseLyricSpaces';
import normaliseSectionPaddings from 'modules/Songs/utils/processSong/normaliseSectionPaddings';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useWindowSize } from 'react-use';
import AdjustPlayback from 'routes/Convert/Steps/SyncLyricsToVideo/Components/AdjustPlayback';
import EditSection, { ChangeRecord } from 'routes/Convert/Steps/SyncLyricsToVideo/Components/EditSection';
import ManipulateBpm from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ManipulateBpm';
import ShiftGap from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ShiftGap';
import ShiftVideoGap from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ShiftVideoGap';
import Player, { PlayerRef } from 'routes/Game/Singing/Player';
import ShortcutIndicator from './Components/ShortcutIndicator';

interface Props {
  song: Song;
  onUpdate?: (song: Song) => void;
  visible: boolean;
}

const shiftGap = (song: Song, gapShift: number): Song => ({ ...song, gap: song.gap + gapShift });
const shiftVideoGap = (song: Song, gapShift: number): Song => ({ ...song, videoGap: (song.videoGap ?? 0) + gapShift });
const setBpm = (song: Song, bpm: number): Song => ({ ...song, bpm });

const applyChanges = (song: Song, changes: ChangeRecord[]) => ({
  ...song,
  tracks: song.tracks.map((track, trackIndex) => {
    const changeList = changes.filter((change) => change.track === trackIndex);

    let sections = [...track.sections].filter(isNotesSection);

    changeList.forEach((change) => {
      if (change.type === 'delete') {
        sections = sections.filter((_, index) => index !== change.section);
      } else if (change.type === 'shift') {
        const shift = change.shift - getFirstNoteStartFromSections([sections[change.section]]);
        sections = sections.map((section, index) => {
          if (index < change.section) return section;

          return { ...section, notes: section.notes.map((note) => ({ ...note, start: note.start + shift })) };
        });
      }
    });

    return { ...track, sections };
  }),
});

const applyTrackNames = (song: Song, trackNames: (string | undefined)[]): Song => ({
  ...song,
  tracks: song.tracks.map((track, index) => ({
    ...track,
    name: trackNames[index] ?? track.name,
  })),
});

const applyLyricChanges = (song: Song, lyricChanges: Record<number, Record<number, Record<number, string>>>) => ({
  ...song,
  tracks: song.tracks.map((track, trackIndex) => {
    const trackLyricChanges = lyricChanges[trackIndex] ?? {};

    return {
      ...track,
      sections: track.sections.map((section, sectionIndex) => {
        const sectionLyricChanges = trackLyricChanges[sectionIndex] ?? {};

        if (!isNotesSection(section)) return section;

        return {
          ...section,
          notes: section.notes.map((note, noteIndex) => ({
            ...note,
            lyrics: sectionLyricChanges[noteIndex] ?? note.lyrics,
          })),
        };
      }),
    };
  }),
});

export default function EditSong({ song, onUpdate, visible }: Props) {
  const player = useRef<PlayerRef | null>(null);
  const [currentTime, setCurrentTime] = useState<milliseconds>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const { width } = useWindowSize();
  const playerWidth = Math.min(width - 16, 824);
  const playerHeight = (playerWidth / 16) * 9;

  const [gapShift, setGapShift] = useState<string>('0');
  const [videoGapShift, setVideoGapShift] = useState<number>(0);
  const [overrideBpm, setOverrideBpm] = useState<number>(song.bpm);
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);
  const [trackNames, setTrackNames] = useState(song.tracks.map((track) => track.name ?? undefined));
  const [lyricChanges, setLyricChanges] = useState<Record<number, Record<number, Record<number, string>>>>({});

  const newSong = useMemo(() => {
    let processed = cloneDeep(song);

    processed = normaliseGap(processed);
    processed = addHeadstart(processed);
    processed = normaliseSectionPaddings(processed);
    if (!isNaN(Number(gapShift))) processed = shiftGap(processed, Number(gapShift));
    processed = shiftVideoGap(processed, videoGapShift);
    processed = setBpm(processed, overrideBpm);
    processed = applyChanges(processed, changeRecords);
    processed = applyTrackNames(processed, trackNames);
    processed = applyLyricChanges(processed, lyricChanges);
    processed = normaliseSectionPaddings(processed);
    processed = normaliseLyricSpaces(processed);

    return processed;
  }, [gapShift, videoGapShift, song, overrideBpm, changeRecords, trackNames, lyricChanges]);

  useEffect(() => {
    onUpdate?.(newSong);
  }, [onUpdate, newSong]);

  const singSetup = useMemo<SingSetup>(
    () => ({
      id: 'test',
      mode: GAME_MODE.DUEL,
      players: [
        { number: 0, track: 0 },
        { number: 1, track: song.tracks.length - 1 },
      ],
      tolerance: 6,
    }),
    [song],
  );

  const beatLength = getSongBeatLength(newSong);

  useEffect(() => {
    if (!visible) {
      player.current?.pause();
    }
  }, [visible]);

  useEffect(() => {
    player.current?.setPlaybackSpeed(playbackSpeed);
  }, [playbackSpeed]);

  const seekToNote = (note?: Note, padding: seconds = 0.5 * playbackSpeed) => {
    if (note && player.current) {
      player.current.seekTo((note.start * beatLength + newSong.gap) / 1000 - padding);
      player.current.play();
    }
  };

  const seekToFirstSection = (padding?: seconds) => {
    const firstNote = getFirstNoteFromSection(newSong.tracks[0].sections);
    seekToNote(firstNote, padding);
  };

  const seekToSubsequentSection = async (direction: -1 | 1, padding?: seconds) => {
    if (!player.current) return;
    const currentBeat = getCurrentBeat(await player.current!.getCurrentTime!(), beatLength, newSong.gap);
    const notesSections = newSong.tracks[0].sections.filter(isNotesSection);
    const currentSectionIndex = notesSections.findIndex(
      (section) => getSectionStart(section) <= currentBeat && getSectionEnd(section) >= currentBeat,
    );
    if (currentSectionIndex === -1 || notesSections[currentSectionIndex + direction] === undefined) return;

    seekToNote(notesSections[currentSectionIndex + direction].notes[0], padding);
  };

  const seekToNextSection = (padding?: seconds) => {
    seekToSubsequentSection(1, padding);
  };
  const seekToPreviousSection = (padding?: seconds) => {
    seekToSubsequentSection(-1, padding);
  };

  const seekToLastSection = (padding?: seconds) => {
    const lastNoteStart = getLastNotesSection(newSong.tracks[0].sections)?.notes[0];
    seekToNote(lastNoteStart, padding);
  };

  useHotkeys(
    '1',
    () => {
      setPlaybackSpeed(0.25);
    },
    [newSong, setPlaybackSpeed],
  );
  useHotkeys(
    '2',
    () => {
      setPlaybackSpeed(0.5);
    },
    [newSong, setPlaybackSpeed],
  );
  useHotkeys(
    '3',
    () => {
      setPlaybackSpeed(1);
    },
    [newSong, setPlaybackSpeed],
  );
  useHotkeys(
    '4',
    () => {
      setPlaybackSpeed(2);
    },
    [newSong, setPlaybackSpeed],
  );

  useHotkeys(
    'q',
    () => {
      seekToFirstSection();
    },
    [newSong, seekToFirstSection],
  );
  useHotkeys(
    'w',
    () => {
      seekToPreviousSection();
    },
    [newSong, seekToPreviousSection],
  );
  useHotkeys(
    'e',
    () => {
      seekToNextSection();
    },
    [newSong, seekToNextSection],
  );
  useHotkeys(
    'r',
    () => {
      seekToLastSection();
    },
    [newSong],
  );
  useHotkeys('a', () => {
    setGapShift((current) => String(Number(current) - 50));
  });
  useHotkeys('s', () => {
    setGapShift((current) => String(Number(current) + 50));
  });

  useHotkeys('z', () => {
    setOverrideBpm((current) => current - 0.1);
  });
  useHotkeys('x', () => {
    setOverrideBpm((current) => current + 0.1);
  });

  return (
    <Grid container spacing={2} sx={{ display: visible ? undefined : 'none' }}>
      <Grid item xs={12} sm={8} data-test="player-container">
        <Box sx={{ width: playerWidth, height: playerHeight }}>
          <Player
            key={0}
            song={newSong}
            showControls
            autoplay={false}
            width={playerWidth}
            height={playerHeight}
            ref={player}
            onCurrentTimeUpdate={setCurrentTime}
            effectsEnabled={false}
            singSetup={singSetup}
            onSongEnd={() => undefined}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {player.current && (
          <>
            <AdjustPlayback
              player={player.current}
              currentTime={currentTime}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
            />
            <div className="flex justify-between">
              <ShortcutIndicator shortcutKey="q">
                <Button variant="outlined" size="small" onClick={() => seekToFirstSection()}>
                  First section
                </Button>
              </ShortcutIndicator>
              <ShortcutIndicator shortcutKey="w">
                <Button variant="outlined" size="small" onClick={() => seekToPreviousSection()}>
                  Prev
                </Button>
              </ShortcutIndicator>
              <ShortcutIndicator shortcutKey="e">
                <Button variant="outlined" size="small" onClick={() => seekToNextSection()}>
                  Next
                </Button>
              </ShortcutIndicator>
              <ShortcutIndicator shortcutKey="r">
                <Button variant="outlined" size="small" onClick={() => seekToLastSection()}>
                  Last section
                </Button>
              </ShortcutIndicator>
            </div>
          </>
        )}
        {!player.current && <h2>Start the song to see the manipulation form</h2>}
      </Grid>
      {player.current && (
        <>
          <Grid item xs={12} sm={8}>
            <div className="flex flex-1 flex-col gap-5 sm:flex-row">
              <ShiftVideoGap
                player={player.current}
                onChange={(newShift) => {
                  const delta = newShift - videoGapShift;
                  setVideoGapShift(newShift);
                  // video gap is not automatically added to gap, need to adjust it here directly
                  setGapShift((current) =>
                    !isNaN(Number(current)) ? String(Number(current) + delta * 1000) : current,
                  );
                }}
                current={videoGapShift}
                finalGap={newSong.videoGap}
              />
              <ShiftGap player={player.current} onChange={setGapShift} current={gapShift} finalGap={newSong.gap} />
            </div>
          </Grid>
          <Grid item xs={0} sm={4} className="hidden sm:block">
            <div className="mb-2 text-xs">
              Use <strong>Video shift gap</strong> to crop the beginning of the video if it starts with an intro.
            </div>
            <div className="mb-2 text-xs">
              Use <strong>Lyrics shift gap</strong> to sync the start of the lyrics to the video. You can lower the{' '}
              <strong>Playback speed</strong> above to make sure you got it just right.{' '}
            </div>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant={'h5'} mb={2}>
              Advanced
            </Typography>
            <ManipulateBpm onChange={setOverrideBpm} current={overrideBpm} song={newSong} key={newSong.gap} />
          </Grid>
          <Grid item xs={0} sm={4} className="hidden sm:block">
            <div className="mb-2 text-xs">
              If the lyrics desynchronise over time, probably the tempo (BPM) of the lyrics is wrong.
            </div>
            <div className="mb-2 text-xs">
              You can either use <strong>Last note end time</strong> - enter the millisecond when the last note should
              end (seek through the video for the moment as <strong>Current time</strong> panel show the exact
              millisecond) and a suggested BPM value will appear below.
            </div>
            <div className="mb-2 text-xs">
              <strong>Tempo (BPM)</strong> field allows to fine-tune the tempo.
            </div>
          </Grid>
          <Grid item xs={12} sm={8}>
            <EditSection
              playbackSpeed={playbackSpeed}
              song={newSong}
              currentTime={currentTime}
              beatLength={beatLength}
              player={player.current}
              onRecordChange={setChangeRecords}
              onTrackNameChange={(track, newName) =>
                setTrackNames((current) => {
                  const newNames = [...current];
                  newNames[track] = newName === '' ? undefined : newName;

                  return newNames;
                })
              }
              lyricChanges={lyricChanges}
              onLyricChange={(change) =>
                setLyricChanges((current) => ({
                  ...current,
                  [change.track]: {
                    ...current[change.track],
                    [change.section]: {
                      ...current[change.track]?.[change.section],
                      [change.noteIndex]: change.newLyric,
                    },
                  },
                }))
              }
            />
          </Grid>
          <Grid item xs={0} sm={4} className="hidden sm:block">
            <div className="mb-2 text-xs">
              If the lyrics there are more lyrics than in the video or there are longer/shorter interludes between
              verses, you can <strong>Edit verses</strong>.
            </div>
            <div className="mb-2 text-xs">Select a verse by clicking on it.</div>
            <div className="mb-2 text-xs">
              You can either <strong>Change its start beat</strong> (which will &quot;move in time&quot; the verse and
              all subsequent ones) or <strong>Delete it</strong> (it won&#39;t affect the timing of other verses). You
              can also edit the lyrics of each note.
            </div>
            <div className="mb-2 text-xs">
              <strong>List of changes</strong> on the right allows you to see and undo the actions one by one.
            </div>
          </Grid>
        </>
      )}
    </Grid>
  );
}
