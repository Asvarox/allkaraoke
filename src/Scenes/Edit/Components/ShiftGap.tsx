import { PlayerRef } from '../../Game/Singing/Player';
import { EditorRow, InputGroup, InputGroupButton, InputGroupInput } from '../Elements';
import { msec } from '../Helpers/formatMs';

interface Props {
    onChange: (shift: number) => void;
    current: number;
    player: PlayerRef;
    finalGap: number;
}

export default function ShiftGap({ current, onChange, player, finalGap }: Props) {
    return (
        <EditorRow>
            Gap shift (final gap: {msec(finalGap, player)})
            <InputGroup>
                <InputGroupButton onClick={() => onChange(current - 1000)}>-1000</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current - 500)}>-500</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current - 50)}>-50</InputGroupButton>
                <InputGroupInput
                    type="text"
                    value={current}
                    onChange={(e) => onChange(+current)}
                    placeholder="Gap shift"
                />
                <InputGroupButton onClick={() => onChange(current + 50)}>+50</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current + 500)}>+500</InputGroupButton>
                <InputGroupButton onClick={() => onChange(current + 1000)}>+1000</InputGroupButton>
            </InputGroup>
        </EditorRow>
    );
}
