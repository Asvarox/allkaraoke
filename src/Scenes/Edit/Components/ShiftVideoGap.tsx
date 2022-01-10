import { PlayerRef } from '../../Game/Singing/Player';
import { EditorRow, InputGroup, InputGroupButton, InputGroupInput } from '../Elements';
import { msec } from '../Helpers/formatMs';

interface Props {
    onChange: (shift: number) => void;
    current: number;
    player: PlayerRef;
    finalGap: number | undefined;
}

export default function ShiftVideoGap({ current, onChange, player, finalGap }: Props) {
    return (
        <EditorRow>
            Video Gap shift (final video gap: {msec((finalGap ?? 0) * 1000, player)})
            <InputGroup>
                <InputGroupButton onClick={() => onChange(current - 10)}>-10</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current - 5)}>-5</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current - 1)}>-1</InputGroupButton>
                <InputGroupInput
                    type="text"
                    value={current}
                    onChange={(e) => onChange(+e.target.value)}
                    placeholder="Gap shift"
                />
                <InputGroupButton onClick={() => onChange(current + 1)}>+1</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current + 5)}>+5</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current + 10)}>+10</InputGroupButton>
            </InputGroup>
        </EditorRow>
    );
}
