import { useState } from 'react';
import { Song } from '../../../interfaces';
import calculateProperBPM from '../../Convert/calculateProperBpm';
import { PlayerRef } from '../../Game/Singing/Player';
import { EditorRow, InputGroup, InputGroupInput, Pre } from '../Elements';

interface Props {
    onChange: (bpm: number) => void;
    current: number;
    player: PlayerRef;
    song: Song;
}

export default function ManipulateBpm({ current, onChange, player, song }: Props) {
    const [desiredLastNoteEnd, setDesiredLastNoteEnd] = useState<number>(0);

    return (
        <>
            <EditorRow>
                <InputGroup>
                    <span>Desired last note end</span>
                    <InputGroupInput
                        type="text"
                        value={desiredLastNoteEnd}
                        onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
                        placeholder="Desired last note end"
                        style={{ flex: 0, width: 70 }}
                    />
                    {!!desiredLastNoteEnd && (
                        <>
                            Est. proper BPM: <Pre>{calculateProperBPM(desiredLastNoteEnd, song)}</Pre>
                        </>
                    )}
                </InputGroup>
            </EditorRow>
            <EditorRow>
                <strong>BPM: </strong>
                <InputGroupInput type="number" value={current} onChange={(e) => onChange(+e.target.value)} step="0.1" />
            </EditorRow>
        </>
    );
}
