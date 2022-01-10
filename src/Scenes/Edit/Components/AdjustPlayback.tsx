import { EditorRow, InputGroup, InputGroupButton, Pre } from '../Elements';
import formatMs from '../Helpers/formatMs';
import { PlayerRef } from '../../Game/Singing/Player';

interface Props {
    player: PlayerRef;
    currentTime: number;
}

export default function AdjustPlayback({ player, currentTime }: Props) {
    const seekBy = (bySec: number) => player.seekTo((currentTime + bySec) / 1000);

    return (
        <>
            <EditorRow>
                Playback speed:
                <InputGroup>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <InputGroupButton key={speed} onClick={() => player.setPlaybackSpeed(speed)}>
                            {speed}
                        </InputGroupButton>
                    ))}
                </InputGroup>
            </EditorRow>
            <EditorRow>
                Current time: {formatMs(currentTime)}
                <InputGroup>
                    <InputGroupButton onClick={() => seekBy(-10000)}>-10s</InputGroupButton>
                    <InputGroupButton onClick={() => seekBy(-5000)}>-5s</InputGroupButton>
                    <InputGroupButton onClick={() => seekBy(-1000)}>-1s</InputGroupButton>
                    <InputGroupButton onClick={() => seekBy(-500)}>-0.5s</InputGroupButton>
                    <div style={{ flex: 1 }}>
                        <Pre>{currentTime.toFixed(0)}</Pre>
                    </div>
                    <InputGroupButton onClick={() => seekBy(+500)}>+0.5s</InputGroupButton>
                    <InputGroupButton onClick={() => seekBy(+1000)}>+1s</InputGroupButton>
                    <InputGroupButton onClick={() => seekBy(+5000)}>+5s</InputGroupButton>
                    <InputGroupButton onClick={() => seekBy(+10000)}>+10s</InputGroupButton>
                </InputGroup>
            </EditorRow>
        </>
    );
}
