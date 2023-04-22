import styled from '@emotion/styled';
import { Autocomplete } from 'Elements/Autocomplete';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useRef } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

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
    const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
    const p1NameRef = useRef<HTMLInputElement | null>(null);

    const togglePlayerTrack = () => onChange({ ...setup, track: (setup.track + 1) % songPreview.tracksCount });

    const onNameChange = (newName: string) => onChange({ ...setup, name: newName });

    return (
        <>
            <PlayerName
                value={setup.name}
                options={playerNames}
                onChange={onNameChange}
                label="Name:"
                ref={p1NameRef}
                {...register(`p${index} name`, () => p1NameRef.current?.focus())}
                placeholder={defaultName}
                data-test={`player-${index}-name`}
            />
            {!mobilePhoneMode && songPreview.tracksCount > 1 && (
                <Track
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

const PlayerName = styled(Autocomplete)`
    input {
        font-size: 4.5rem;
    }

    [role='listbox'] {
        max-height: ${6 * (4.5 + 0.3)}rem;
    }
`;
const Track = styled(Switcher)`
    font-size: 4.5rem;
    padding: 1.1rem;
`;
