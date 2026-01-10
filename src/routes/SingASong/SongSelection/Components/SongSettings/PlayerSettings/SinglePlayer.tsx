import styled from '@emotion/styled';
import { MAX_NAME_LENGTH } from 'consts';
import { PlayerSetup, SongPreview } from 'interfaces';
import { Autocomplete } from 'modules/Elements/Autocomplete';
import { Switcher } from 'modules/Elements/Switcher';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import { PlayerEntity } from 'modules/Players/PlayersManager';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import { ComponentRef, useCallback, useRef, useState } from 'react';

interface Props {
  multipleTracks: boolean;
  player: PlayerEntity | undefined;
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
  const nameRef = useRef<ComponentRef<typeof Autocomplete>>(null);
  // Force update when the name changes
  useEventListener(events.playerNameChanged);

  const focusName = useCallback(() => nameRef.current?.element?.focus(), []);

  if (player === undefined) {
    return null;
  }

  const togglePlayerTrack = () =>
    onChange({ number: player.number, track: (setup.track + 1) % songPreview.tracksCount });

  const onNameChange = (newName: string) => {
    setInputTouched(true);
    player.setName(newName);
  };

  const isDefaultName = !inputTouched;
  const currentName = player.getName();

  return (
    <div className="flex flex-1 flex-col gap-2">
      <PlayerName
        maxLength={MAX_NAME_LENGTH}
        className="ph-no-capture w-full"
        value={isDefaultName ? '' : currentName}
        placeholder={isDefaultName ? currentName : undefined}
        options={playerNames}
        onChange={onNameChange}
        label="Name:"
        ref={nameRef}
        {...register(`player-${player.number}-name`, focusName)}
      />
      {multipleTracks && (
        <Track
          {...register(`player-${player.number}-track-setting`, togglePlayerTrack, 'Change track')}
          label="Track"
          value={getTrackName(songPreview.tracks, setup.track)}
          data-test-value={setup.track + 1}
        />
      )}
    </div>
  );
}

const PlayerName = styled(Autocomplete)`
  button {
    width: 100%;
  }
  [role='listbox'] {
    max-height: ${6 * (3 + 0.3)}rem;
  }
`;
const Track = styled(Switcher)`
  width: 100%;
`;
