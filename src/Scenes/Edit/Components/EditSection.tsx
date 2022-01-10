import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Song } from '../../../interfaces';
import getCurrentBeat from '../../Game/Singing/Helpers/getCurrentBeat';
import isNotesSection from '../../Game/Singing/Helpers/isNotesSection';
import { getFirstNoteStartFromSections } from '../../Game/Singing/Helpers/notesSelectors';
import useCurrentSectionIndex from '../../Game/Singing/Hooks/useCurrentSectionIndex';
import { PlayerRef } from '../../Game/Singing/Player';
import { msec } from '../Helpers/formatMs';

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
            const lastRecord = records[records.length - 1];

            if (
                lastRecord &&
                lastRecord.type === 'shift' &&
                lastRecord.track === track &&
                lastRecord.section === selectedSection
            ) {
                const newRecords = [...records];
                (newRecords[records.length - 1] as ChangeRecordShift).shift = newStart;

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
            <h3>
                Edit section
                {song.tracks.map((_, index) => (
                    <button key={index} onClick={() => setTrack(index)}>
                        Track {index + 1}
                    </button>
                ))}
            </h3>
            <Editor>
                <SectionList>
                    {sections.map((section, index) => (
                        <SectionListEntry
                            key={section.start}
                            active={index === currentSectionIndex}
                            selected={selectedSection === index}
                            onClick={() => onSectionClick(index)}>
                            {isNotesSection(section) ? section.notes.map((note) => note.lyrics).join('') : '[pause]'}
                        </SectionListEntry>
                    ))}
                </SectionList>

                <SectionEditForm>
                    {selectedSection > -1 && (
                        <>
                            {selectedSection === 0 && <h3>Use gap shift to change when this section starts</h3>}
                            {selectedSection > 0 && (
                                <>
                                    <strong>Change start beat</strong>
                                    <input
                                        type="number"
                                        step="1"
                                        onChange={(e) => shiftSection(+e.target.value)}
                                        value={getFirstNoteStartFromSections([sections[selectedSection]])}
                                    />
                                    (currently{' '}
                                    {msec(
                                        getFirstNoteStartFromSections([sections[selectedSection]]) * beatLength +
                                            song.gap,
                                        player,
                                    )}
                                    )
                                </>
                            )}
                            <br />
                            <button onClick={deleteSection}>Delete section</button>
                        </>
                    )}
                </SectionEditForm>
                <SectionChangeList>
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
                            <Component>
                                <strong>
                                    Track: {change.track + 1}, Section: {change.section + 1}, {message}
                                </strong>
                            </Component>
                        );
                    })}
                    {changeRecords.length > 0 && (
                        <button
                            onClick={() =>
                                setChangeRecords((records) =>
                                    records.filter((_, index) => index !== records.length - 1),
                                )
                            }>
                            Undo
                        </button>
                    )}
                </SectionChangeList>
            </Editor>
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
    height: 400px;
    flex: 1;
    overflow-y: auto;
`;
const SectionListEntry = styled.div<{ active: boolean; selected: boolean }>`
    font-weight: ${(props) => (props.active ? 'bold' : 'normal')};

    border: 1px solid;
    border-color: ${(props) => (props.selected ? 'black' : 'white')};

    padding: 10px;
`;
