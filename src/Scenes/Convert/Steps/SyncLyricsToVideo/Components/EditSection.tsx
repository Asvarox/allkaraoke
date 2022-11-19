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
import { useEffect, useState } from 'react';
import { msec } from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import getCurrentBeat from 'Scenes/Game/Singing/GameState/Helpers/getCurrentBeat';
import isNotesSection from 'Scenes/Game/Singing/Helpers/isNotesSection';
import { getFirstNoteStartFromSections } from 'Scenes/Game/Singing/Helpers/notesSelectors';
import useCurrentSectionIndex from 'Scenes/Game/Singing/Hooks/useCurrentSectionIndex';
import { PlayerRef } from 'Scenes/Game/Singing/Player';

interface Props {
    song: Song;
    currentTime: number;
    beatLength: number;
    player: PlayerRef;
    onChange: (changeRecords: ChangeRecord[]) => void;
}

interface ChangeRecordBase {
    track: number;
    section: number;
}

interface ChangeRecordShift extends ChangeRecordBase {
    track: number;
    section: number;
    type: 'shift';
    shift: number;
}

interface ChangeRecordDelete extends ChangeRecordBase {
    track: number;
    section: number;
    type: 'delete';
}

export type ChangeRecord = ChangeRecordDelete | ChangeRecordShift;

export default function EditSection({ song, currentTime, beatLength, player, onChange }: Props) {
    const [track, setTrack] = useState(0);
    const [selectedSection, setSelectedSection] = useState(-1);
    const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);
    const currentBeat = getCurrentBeat(currentTime, beatLength, song.gap);

    const sections = song.tracks[track].sections.filter(isNotesSection);

    const currentSectionIndex = useCurrentSectionIndex(sections, currentBeat);

    const onSectionClick = (index: number) => {
        setSelectedSection(index);
        GameState.resetPlayerNotes();
        player.seekTo((sections[index].start * beatLength + song.gap) / 1000);
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
        onChange(changeRecords);
    }, [onChange, changeRecords]);

    return (
        <SectionEdtiorContainer>
            <Typography variant={'h6'} mb={0}>
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
            <Stack direction="row" spacing={2} sx={{ height: '400px' }}>
                <List sx={{ overflowY: 'auto' }}>
                    {sections.map((section, index) => (
                        <ListItem key={section.start} disablePadding data-test={`section-${index}`}>
                            <ListItemButton onClick={() => onSectionClick(index)} selected={selectedSection === index}>
                                <ListItemText
                                    primaryTypographyProps={{
                                        fontWeight: index === currentSectionIndex ? 'bold' : 'normal',
                                    }}
                                    primary={
                                        isNotesSection(section)
                                            ? section.notes.map((note) => note.lyrics).join('')
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
                                                    getFirstNoteStartFromSections([sections[selectedSection]]) *
                                                        beatLength +
                                                        song.gap,
                                                    player,
                                                )}
                                            </>
                                        }
                                    />
                                </>
                            )}
                            <Button
                                variant="contained"
                                color={'error'}
                                onClick={deleteSection}
                                fullWidth
                                data-test="delete-section">
                                Delete section
                            </Button>
                        </>
                    )}
                </SectionEditForm>
                <SectionChangeList>
                    <Box sx={{ overflowY: 'auto', maxHeight: '340px' }} data-test="change-list">
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
                            onClick={() =>
                                setChangeRecords((records) =>
                                    records.filter((_, index) => index !== records.length - 1),
                                )
                            }
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
    padding: 5px;
`;

const SectionChangeDelete = styled(ChangeEntry)`
    color: red;
`;

const SectionChangeShift = styled(ChangeEntry)`
    color: #0059ff;
`;

const Editor = styled.div`
    display: flex;
    flex-direction: row;
`;

const SectionEdtiorContainer = styled.div``;

const SectionEditForm = styled.div`
    flex: 1;
`;

const SectionList = styled.div`
    flex: 1;
    overflow-y: auto;
`;
const SectionListEntry = styled.div<{ active: boolean; selected: boolean }>`
    font-weight: ${(props) => (props.active ? 'bold' : 'normal')};

    border: 1px solid;
    border-color: ${(props) => (props.selected ? 'black' : 'white')};

    padding: 10px;
`;
