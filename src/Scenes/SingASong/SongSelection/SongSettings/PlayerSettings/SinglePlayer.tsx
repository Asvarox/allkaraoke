import styled from '@emotion/styled';
import { Autocomplete } from 'Elements/Autocomplete';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useRef, useState } from 'react';
import { MAX_NAME_LENGTH } from 'consts';
import { PlayerEntity } from 'Scenes/PlayersManager';
import { useEventListener } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';

interface Props {
    multipleTracks: boolean;
    player: PlayerEntity;
    songPreview: SongPreview;
    onChange: (setup: PlayerSetup) => void;
    setup: PlayerSetup;
    playerNames: string[];
    register: ReturnType<typeof useKeyboardNav>['register'];
}

const getTrackName = (tracks: SongPreview['tracks'], index: number) => tracks[index]?.name ?? `Track ${index + 1}`;

export default function SinglePlayer({
    multipleTracks,
    player,
    songPreview,
    playerNames,
    register,
    onChange,
    setup,
}: Props) {
    const [inputTouched, setInputTouched] = useState(false);
    const nameRef = useRef<HTMLInputElement | null>(null);
    // Force update when the name changes
    useEventListener(events.playerNameChanged);

    const togglePlayerTrack = () =>
        onChange({ number: player.number, track: (setup.track + 1) % songPreview.tracksCount });

    const onNameChange = (newName: string) => {
        setInputTouched(true);
        player.setName(newName);
    };

    const isDefaultName = !inputTouched;
    const currentName = player.getName();

    return (
        <>
            <PlayerName
                maxLength={MAX_NAME_LENGTH}
                className="ph-no-capture"
                value={isDefaultName ? '' : currentName}
                placeholder={isDefaultName ? currentName : undefined}
                options={playerNames}
                onChange={onNameChange}
                label="Name:"
                ref={nameRef}
                {...register(`player-${player.number}-name`, () => nameRef.current?.focus())}
            />
            {multipleTracks && (
                <Track
                    {...register(`player-${player.number}-track-setting`, togglePlayerTrack, 'Change track')}
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
