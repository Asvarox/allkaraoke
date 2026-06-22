import { Button, Typography } from '@mui/material';
import { cloneDeep } from 'es-toolkit';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useWindowSize } from 'react-use';
import createPersistedState from 'use-persisted-state';
import { GAME_MODE, Note, seconds, SingSetup, Song } from '~/interfaces';
import { VideoState } from '~/modules/elements/video-player/index';
import getCurrentBeat from '~/modules/game-engine/game-state/helpers/get-current-beat';
import getSongBeatLength from '~/modules/songs/utils/get-song-beat-length';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import { getFirstNoteStartFromSections } from '~/modules/songs/utils/notes-selectors';
import addHeadstart from '~/modules/songs/utils/process-song/add-headstart';
import normaliseGap from '~/modules/songs/utils/process-song/normalise-gap';
import normaliseLyricSpaces from '~/modules/songs/utils/process-song/normalise-lyric-spaces';
import normaliseSectionPaddings from '~/modules/songs/utils/process-song/normalise-section-paddings';
import AdjustPlayback from '~/routes/convert/steps/sync-lyrics-to-video/components/adjust-playback';
import EditSection, { ChangeRecord } from '~/routes/convert/steps/sync-lyrics-to-video/components/edit-section';
import ManipulateBpm from '~/routes/convert/steps/sync-lyrics-to-video/components/manipulate-bpm';
import SectionSlider from '~/routes/convert/steps/sync-lyrics-to-video/components/section-slider';
import ShiftGap from '~/routes/convert/steps/sync-lyrics-to-video/components/shift-gap';
import ShiftVideoGap from '~/routes/convert/steps/sync-lyrics-to-video/components/shift-video-gap';
import useCurrentSectionIndex from '~/routes/game/singing/hooks/use-current-section-index';
import Player, { PlayerRef } from '~/routes/game/singing/player';
import ShortcutIndicator from './components/shortcut-indicator';

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

const usePlaybackSpeed = createPersistedState<number>('edit-song-playback-speed');

export default function EditSong({ song, onUpdate, visible }: Props) {
  const player = useRef<PlayerRef | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = usePlaybackSpeed(1);
  const [playerState, setPlayerState] = useState(VideoState.UNSTARTED);
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
  const notesSections = useMemo(() => newSong.tracks[0].sections.filter(isNotesSection), [newSong]);
  const currentSectionIndex = useCurrentSectionIndex(notesSections, player.current, beatLength, newSong.gap);

  useEffect(() => {
    if (!visible) {
      player.current?.pause();
    }
  }, [visible]);

  useEffect(() => {
    player.current?.setPlaybackSpeed(playbackSpeed);
  }, [playbackSpeed, playerState]);

  const seekToNote = (note?: Note, padding: seconds = 0.5 * playbackSpeed) => {
    if (note && player.current) {
      player.current.seekTo((note.start * beatLength + newSong.gap) / 1000 - padding);
      player.current.play();
    }
  };

  const seekToFirstSection = (padding?: seconds) => {
    seekToSection(0, padding);
  };

  const seekToSection = (sectionIndex: number, padding?: seconds) => {
    if (notesSections.length === 0) return;

    const finalSectionIndex = Math.max(Math.min(sectionIndex, notesSections.length - 1), 0);
    seekToNote(notesSections[finalSectionIndex].notes[0], padding);
  };

  const seekToSubsequentSection = async (direction: -1 | 1, padding?: seconds) => {
    if (!player.current) return;
    const currentBeat = getCurrentBeat(await player.current!.getCurrentTime!(), beatLength, newSong.gap);
    const targetSectionIndex = notesSections.filter((section) => section.start <= currentBeat).length - 1 + direction;

    const finalSectionIndex = Math.max(Math.min(targetSectionIndex, notesSections.length - 1), 0);

    seekToSection(finalSectionIndex, padding);
  };

  const seekToNextSection = (padding?: seconds) => {
    seekToSubsequentSection(1, padding);
  };
  const seekToPreviousSection = (padding?: seconds) => {
    seekToSubsequentSection(-1, padding);
  };

  const seekToLastSection = (padding?: seconds) => {
    seekToSection(notesSections.length - 1, padding);
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
    <div className={visible ? 'grid grid-cols-12 gap-4' : 'hidden'}>
      <div className="col-span-12 sm:col-span-8" data-test="player-container">
        <div style={{ width: playerWidth, height: playerHeight }}>
          <Player
            onStatusChange={setPlayerState}
            key={0}
            song={newSong}
            showControls
            autoplay={false}
            width={playerWidth}
            height={playerHeight}
            ref={player}
            effectsEnabled={false}
            singSetup={singSetup}
            onSongEnd={() => undefined}
          />
        </div>
      </div>
      <div className="col-span-12 flex flex-col gap-4 sm:col-span-4">
        {player.current && (
          <>
            <AdjustPlayback player={player.current} playbackSpeed={playbackSpeed} setPlaybackSpeed={setPlaybackSpeed} />
            <div className="flex justify-between">
              <ShortcutIndicator shortcutKey="q">
                <Button variant="outlined" size="small" onClick={() => seekToSection(0)}>
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
            <SectionSlider
              notesSections={notesSections}
              currentSectionIndex={currentSectionIndex}
              onSeekSection={seekToSection}
            />
          </>
        )}
        {!player.current && <h2>Start the song to see the manipulation form</h2>}
      </div>
      {player.current && (
        <>
          <div className="col-span-12 sm:col-span-8">
            <div className="flex flex-1 flex-col-reverse gap-5 sm:flex-row">
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
          </div>
          <div className="hidden sm:col-span-4 sm:block">
            <div className="mb-2 text-xs">
              Use <strong>Video shift gap</strong> to crop the beginning of the video if it starts with an intro.
            </div>
            <div className="mb-2 text-xs">
              Use <strong>Lyrics shift gap</strong> to sync the start of the lyrics to the video. You can lower the{' '}
              <strong>Playback speed</strong> above to make sure you got it just right.{' '}
            </div>
          </div>
          <div className="col-span-12 sm:col-span-8">
            <Typography variant={'h5'} sx={{ mb: 2 }}>
              Advanced
            </Typography>
            <ManipulateBpm
              onChange={setOverrideBpm}
              onUseCurrentTime={async () => Math.round((await player.current?.getCurrentTime()) ?? 0)}
              current={overrideBpm}
              song={newSong}
              key={newSong.gap}
            />
          </div>
          <div className="hidden sm:col-span-4 sm:block">
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
          </div>
          <div className="col-span-12 sm:col-span-8">
            <EditSection
              playbackSpeed={playbackSpeed}
              song={newSong}
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
          </div>
          <div className="hidden sm:col-span-4 sm:block">
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
          </div>
        </>
      )}
    </div>
  );
}
