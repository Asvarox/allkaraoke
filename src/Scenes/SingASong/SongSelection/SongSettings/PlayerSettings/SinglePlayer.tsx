import styled from '@emotion/styled';
import { Autocomplete } from 'Elements/Autocomplete';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useRef } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { MAX_NAME_LENGTH } from 'consts';

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
                maxLength={MAX_NAME_LENGTH}
                className="ph-no-capture"
                value={setup.name}
                options={playerNames}
                onChange={onNameChange}
                label="Name:"
                ref={p1NameRef}
                {...register(`player-${index}-name`, () => p1NameRef.current?.focus())}
                placeholder={defaultName}
            />
            {!mobilePhoneMode && songPreview.tracksCount > 1 && (
                <Track
                    {...register(`player-${index}-track-setting`, togglePlayerTrack, 'Change track')}
                    label="Track"
                    value={getTrackName(songPreview.tracks, setup.track)}
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
