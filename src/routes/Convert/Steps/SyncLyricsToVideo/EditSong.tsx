import { Box, Grid, Typography } from '@mui/material';
import { GAME_MODE, SingSetup, Song } from 'interfaces';
import { cloneDeep } from 'lodash-es';
import getSongBeatLength from 'modules/Songs/utils/getSongBeatLength';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import { getFirstNoteStartFromSections } from 'modules/Songs/utils/notesSelectors';
import addHeadstart from 'modules/Songs/utils/processSong/addHeadstart';
import normaliseGap from 'modules/Songs/utils/processSong/normaliseGap';
import normaliseLyricSpaces from 'modules/Songs/utils/processSong/normaliseLyricSpaces';
import normaliseSectionPaddings from 'modules/Songs/utils/processSong/normaliseSectionPaddings';
import { useEffect, useMemo, useRef, useState } from 'react';
import AdjustPlayback from 'routes/Convert/Steps/SyncLyricsToVideo/Components/AdjustPlayback';
import EditSection, { ChangeRecord } from 'routes/Convert/Steps/SyncLyricsToVideo/Components/EditSection';
import ListTracks from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ListTracks';
import ManipulateBpm from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ManipulateBpm';
import ShiftGap from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ShiftGap';
import ShiftVideoGap from 'routes/Convert/Steps/SyncLyricsToVideo/Components/ShiftVideoGap';
import Player, { PlayerRef } from 'routes/Game/Singing/Player';

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

const playerWidth = 824;
const playerHeight = (playerWidth / 16) * 9;

export default function EditSong({ song, onUpdate, visible }: Props) {
  const player = useRef<PlayerRef | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [gapShift, setGapShift] = useState<number>(0);
  const [videoGapShift, setVideoGapShift] = useState<number>(0);
  const [overrideBpm, setOverrideBpm] = useState<number>(song.bpm);
  const [playerKey, setPlayerKey] = useState(0);
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(false);
  const [trackNames, setTrackNames] = useState(song.tracks.map((track) => track.name ?? undefined));
  const [lyricChanges, setLyricChanges] = useState<Record<number, Record<number, Record<number, string>>>>({});

  const newSong = useMemo(() => {
    let processed = cloneDeep(song);

    processed = normaliseGap(processed);
    processed = addHeadstart(processed);
    processed = normaliseSectionPaddings(processed);
    processed = shiftGap(processed, gapShift);
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

  return (
    <Grid container spacing={2} sx={{ display: visible ? undefined : 'none' }}>
      <Grid item xs={8} data-test="player-container">
        <Box sx={{ width: playerWidth, height: playerHeight }}>
          <Player
            key={playerKey}
            song={newSong}
            showControls
            autoplay={false}
            width={playerWidth}
            height={playerHeight}
            ref={player}
            onCurrentTimeUpdate={setCurrentTime}
            players={singSetup.players}
            effectsEnabled={effectsEnabled}
            singSetup={singSetup}
            onSongEnd={() => undefined}
          />
        </Box>
      </Grid>
      <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {player.current && (
          <>
            <AdjustPlayback
              player={player.current}
              currentTime={currentTime}
              effectsEnabled={effectsEnabled}
              onEffectsToggle={() => setEffectsEnabled((current) => !current)}
            />
          </>
        )}
        {!player.current && <h2>Start the song to see the manipulation form</h2>}
      </Grid>
      {player.current && (
        <>
          <Grid item xs={8}>
            <Box sx={{ display: 'flex', gap: 5, flex: 1 }}>
              <ShiftVideoGap
                player={player.current}
                onChange={(newShift) => {
                  const delta = newShift - videoGapShift;
                  setVideoGapShift(newShift);
                  // video gap is not automatically added to gap, need to adjust it here directly
                  setGapShift((current) => current + delta * 1000);
                }}
                current={videoGapShift}
                finalGap={newSong.videoGap}
              />
              <ShiftGap player={player.current} onChange={setGapShift} current={gapShift} finalGap={newSong.gap} />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <div className="text-xs mb-2">
              Use <strong>Video shift gap</strong> to crop the beginning of the video if it starts with an intro.
            </div>
            <div className="text-xs mb-2">
              Use <strong>Lyrics shift gap</strong> to sync the start of the lyrics to the video. You can lower the{' '}
              <strong>Playback speed</strong> above to make sure you got it just right.{' '}
            </div>
          </Grid>
          <Grid item xs={8}>
            <Typography variant={'h5'} mb={2}>
              Advanced
            </Typography>
            <ManipulateBpm
              player={player.current}
              onChange={setOverrideBpm}
              current={overrideBpm}
              song={newSong}
              key={newSong.gap}
            />
            <ListTracks player={player.current} song={newSong} beatLength={beatLength} />
          </Grid>
          <Grid item xs={4}>
            <div className="text-xs mb-2">
              If the lyrics desynchronise over time, probably the tempo (BPM) of the lyrics is wrong.
            </div>
            <div className="text-xs mb-2">
              You can either use <strong>Last note end time</strong> - enter the millisecond when the last note should
              end (seek through the video for the moment as <strong>Current time</strong> panel show the exact
              millisecond) and a suggested BPM value will appear below.
            </div>
            <div className="text-xs mb-2">
              <strong>Tempo (BPM)</strong> field allows to fine-tune the tempo.
            </div>
          </Grid>
          <Grid item xs={8}>
            <EditSection
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
          <Grid item xs={4}>
            <div className="text-xs mb-2">
              If the lyrics there are more lyrics than in the video or there are longer/shorter interludes between
              verses, you can <strong>Edit verses</strong>.
            </div>
            <div className="text-xs mb-2">Select a verse by clicking on it.</div>
            <div className="text-xs mb-2">
              You can either <strong>Change its start beat</strong> (which will &quot;move in time&quot; the verse and
              all subsequent ones) or <strong>Delete it</strong> (it won&#39;t affect the timing of other verses). You
              can also edit the lyrics of each note.
            </div>
            <div className="text-xs mb-2">
              <strong>List of changes</strong> on the right allows you to see and undo the actions one by one.
            </div>
          </Grid>
        </>
      )}
    </Grid>
  );
}
