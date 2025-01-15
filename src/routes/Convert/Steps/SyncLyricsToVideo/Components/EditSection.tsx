import styled from '@emotion/styled';
import {
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Song } from 'interfaces';
import GameState from 'modules/GameEngine/GameState/GameState';
import getCurrentBeat from 'modules/GameEngine/GameState/Helpers/getCurrentBeat';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import { getFirstNoteStartFromSections, getSectionStart } from 'modules/Songs/utils/notesSelectors';
import { useEffect, useState } from 'react';
import { msec } from 'routes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import useCurrentSectionIndex from 'routes/Game/Singing/Hooks/useCurrentSectionIndex';
import { PlayerRef } from 'routes/Game/Singing/Player';

interface Props {
  song: Song;
  currentTime: number;
  beatLength: number;
  player: PlayerRef;
  playbackSpeed: number;
  onRecordChange: (changeRecords: ChangeRecord[]) => void;
  onLyricChange: (changeRecords: LyricChangeRecord) => void;
  lyricChanges: Record<number, Record<number, Record<number, string>>>;
  onTrackNameChange: (track: number, newName: string) => void;
}

interface ChangeRecordBase {
  track: number;
  section: number;
}

interface ChangeRecordShift extends ChangeRecordBase {
  type: 'shift';
  shift: number;
}

interface ChangeRecordDelete extends ChangeRecordBase {
  type: 'delete';
}

export interface LyricChangeRecord extends ChangeRecordBase {
  noteIndex: number;
  newLyric: string;
}

export type ChangeRecord = ChangeRecordDelete | ChangeRecordShift;

export default function EditSection({
  song,
  currentTime,
  beatLength,
  player,
  onRecordChange,
  onLyricChange,
  playbackSpeed,
  onTrackNameChange,
  lyricChanges,
}: Props) {
  const [track, setTrack] = useState(0);
  const [selectedSection, setSelectedSection] = useState(-1);
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);
  const currentBeat = getCurrentBeat(currentTime, beatLength, song.gap);

  const sections = song.tracks[track].sections.filter(isNotesSection);

  const currentSectionIndex = useCurrentSectionIndex(sections, currentBeat);

  const onSectionClick = (index: number) => {
    setSelectedSection(index);
    GameState.resetPlayerNotes();
    const firstNoteStart = getSectionStart(sections[index]) * beatLength + song.gap;
    player.seekTo(firstNoteStart / 1000 - 0.8 * playbackSpeed);
  };

  const deleteSection = () => {
    setChangeRecords((records) => [...records, { type: 'delete', section: selectedSection, track }]);
    if (selectedSection === sections.length - 1) {
      setSelectedSection((selected) => selected - 1);
    }
  };

  const shiftSection = (newStart: number) => {
    setChangeRecords((records) => {
      const lastRecord = records.at(-1);

      if (
        lastRecord &&
        lastRecord.type === 'shift' &&
        lastRecord.track === track &&
        lastRecord.section === selectedSection
      ) {
        const newRecords = [...records];
        (newRecords.at(-1)! as ChangeRecordShift).shift = newStart;

        return newRecords;
      }

      return [...records, { type: 'shift', section: selectedSection, track, shift: newStart }];
    });
  };

  useEffect(() => {
    onRecordChange(changeRecords);
  }, [onRecordChange, changeRecords]);

  return (
    <SectionEdtiorContainer>
      <Stack direction="row">
        <Typography variant={'h6'} mb={0} sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          Edit verses
          {song.tracks.length > 1 && (
            <ButtonGroup variant={'contained'} sx={{ ml: 2 }} size={'small'}>
              {song.tracks.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => setTrack(index)}
                  disabled={track === index}
                  data-test={`track-${index + 1}`}>
                  Track {index + 1}
                </Button>
              ))}
            </ButtonGroup>
          )}
        </Typography>
        <TextField
          label={'Track name'}
          placeholder="Set track name"
          sx={{ flex: 1 }}
          size="small"
          value={song.tracks[track]?.name ?? ''}
          onChange={(e) => onTrackNameChange(track, e.target.value)}
          data-test="track-name"
        />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ height: '400px', mt: 3 }}>
        <List sx={{ overflowY: 'auto' }}>
          {sections.map((section, index) => (
            <ListItem
              key={section.start}
              disablePadding
              data-test={`section-${index}`}
              sx={{
                maxWidth: 250,
                overflowX: 'hidden',
                textWrap: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              <ListItemButton onClick={() => onSectionClick(index)} selected={selectedSection === index}>
                <ListItemText
                  primaryTypographyProps={{
                    fontWeight: index === currentSectionIndex ? 'bold' : 'normal',
                  }}
                  primary={
                    isNotesSection(section)
                      ? section.notes.map((note) => note.lyrics.replaceAll(' ', '·')).join('')
                      : '[pause]'
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <SectionEditForm>
          {selectedSection > -1 && (
            <>
              {selectedSection === 0 && (
                <h3 data-test={`use-gap-info`}>Use gap shift to change when this section starts</h3>
              )}
              {selectedSection > 0 && (
                <>
                  <TextField
                    data-test="change-start-beat"
                    size={'small'}
                    type="number"
                    onChange={(e) => shiftSection(+e.target.value)}
                    value={getFirstNoteStartFromSections([sections[selectedSection]])}
                    label="Change start beat"
                    InputProps={{
                      inputProps: {
                        step: 1,
                      },
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                    helperText={
                      <>
                        Timestamp:{' '}
                        {msec(
                          getFirstNoteStartFromSections([sections[selectedSection]]) * beatLength + song.gap,
                          player,
                        )}
                      </>
                    }
                  />
                </>
              )}
              <LyricEditorContainer>
                {sections[selectedSection].notes.map((note, index) => {
                  const lyric = lyricChanges[track]?.[selectedSection]?.[index] ?? note.lyrics;
                  return (
                    <LyricInput
                      style={{ width: `${lyric.length}ch` }}
                      value={lyric}
                      key={index}
                      data-test={`lyric-input-${index}`}
                      onChange={(e) => {
                        onLyricChange({
                          section: selectedSection,
                          track,
                          noteIndex: index,
                          newLyric: e.target.value,
                        });
                      }}
                      onKeyDown={(e) => {
                        // @ts-expect-error selectionStart is not in the types
                        const currentPos = e.target.selectionStart;

                        if (e.key === 'ArrowLeft' && currentPos === 0) {
                          // @ts-expect-error previousElementSibling is not in the types
                          const prevInput = e.target?.previousElementSibling as HTMLInputElement;
                          if (prevInput) {
                            prevInput.focus();
                            setTimeout(
                              () => prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length),
                              10,
                            );
                          }
                          // @ts-expect-error value is not in the types
                        } else if (e.key === 'ArrowRight' && currentPos === e.target.value.length) {
                          // @ts-expect-error nextElementSibling is not in the types
                          const nextInput = e.target?.nextElementSibling as HTMLInputElement;
                          if (nextInput) {
                            nextInput.focus();
                            setTimeout(() => nextInput.setSelectionRange(0, 0), 10);
                          }
                        }
                      }}
                    />
                  );
                })}
              </LyricEditorContainer>
              <Button variant="contained" color={'error'} onClick={deleteSection} fullWidth data-test="delete-section">
                Delete section
              </Button>
            </>
          )}
        </SectionEditForm>
        <SectionChangeList>
          <Box sx={{ overflowY: 'auto', maxHeight: '34rem' }} data-test="change-list">
            {changeRecords.map((change, index) => {
              let message = '';
              let Component = SectionChangeDelete;
              if (change.type === 'delete') {
                Component = SectionChangeDelete;
                message = `Deleted`;
              } else if (change.type === 'shift') {
                Component = SectionChangeShift;
                message = `Start -> ${change.shift}`;
              }

              return (
                <Component key={index}>
                  <strong>
                    Track: {change.track + 1}, Section: {change.section + 1}, {message}
                  </strong>
                </Component>
              );
            })}
          </Box>
          {changeRecords.length > 0 && (
            <Button
              data-test="undo-change"
              variant="contained"
              color={'warning'}
              onClick={() => setChangeRecords((records) => records.filter((_, index) => index !== records.length - 1))}
              fullWidth>
              Undo last change
            </Button>
          )}
        </SectionChangeList>
      </Stack>
    </SectionEdtiorContainer>
  );
}

const SectionChangeList = styled.div`
  flex: 1;
`;

const ChangeEntry = styled.div`
  padding: 0.5rem;
`;

const SectionChangeDelete = styled(ChangeEntry)`
  color: red;
`;

const SectionChangeShift = styled(ChangeEntry)`
  color: #0059ff;
`;

const SectionEdtiorContainer = styled.div``;

const SectionEditForm = styled.div`
  flex: 1;
`;

const LyricEditorContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  column-gap: 0;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const LyricInput = styled.input`
  font-family: monospace;
  background: #f6f6f6;
  width: 3rem;
  padding: 0.5rem 0.1rem;
  border: 0;
  border-right: 1px solid #ececec;
  text-decoration: underline;
  box-sizing: content-box;

  &:focus {
    background: #ececec;
    outline: none !important;
  }
`;
