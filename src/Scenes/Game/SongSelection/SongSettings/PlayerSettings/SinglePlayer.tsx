import { Autocomplete } from 'Elements/Autocomplete';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useRef } from 'react';

interface Props {
    index: number;
    songPreview: SongPreview;
    onChange: (setup: PlayerSetup) => void;
    setup: PlayerSetup;
    playerNames: string[];
    defaultName: string;
    register: ReturnType<typeof useKeyboardNav>['register'];
}

const getTrackName = (tracks: SongPreview['tracks'], index: number) => tracks[index]?.name ?? `Track ${index + 1}`;

export default function SinglePlayer({
    index,
    songPreview,
    playerNames,
    register,
    onChange,
    setup,
    defaultName,
}: Props) {
    const p1NameRef = useRef<HTMLInputElement | null>(null);

    const togglePlayerTrack = () => onChange({ ...setup, track: (setup.track + 1) % songPreview.tracksCount });

    const onNameChange = (newName: string) => onChange({ ...setup, name: newName });

    return (
        <>
            <Autocomplete
                value={setup.name}
                options={playerNames}
                onChange={onNameChange}
                label="Name:"
                ref={p1NameRef}
                {...register(`p${index} name`, () => p1NameRef.current?.focus())}
                placeholder={defaultName}
                data-test={`player-${index}-name`}
            />
            {songPreview.tracksCount > 1 && (
                <Switcher
                    {...register(`p${index} track`, togglePlayerTrack, 'Change track')}
                    label="Track"
                    value={getTrackName(songPreview.tracks, setup.track)}
                    data-test={`player-${index}-track-setting`}
                    data-test-value={setup.track + 1}
                />
            )}
        </>
    );
}
