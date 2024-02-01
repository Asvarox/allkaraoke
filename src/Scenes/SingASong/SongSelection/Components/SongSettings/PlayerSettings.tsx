import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { typography } from 'Elements/cssMixins';
import gameEvents from 'GameEvents/GameEvents';
import { useEventEffect } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import SelectInputModal from 'Scenes/SelectInput/SelectInputModal';
import { MicSetupPreferenceSetting, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SinglePlayer from 'Scenes/SingASong/SongSelection/Components/SongSettings/PlayerSettings/SinglePlayer';
import { PLAYER_NAMES_SESSION_STORAGE_KEY } from 'hooks/players/consts';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { PlayerSetup, SongPreview } from 'interfaces';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  songPreview: SongPreview;
  onNextStep: (players: PlayerSetup[]) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

export default function PlayerSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [storedPreference] = useSettingValue(MicSetupPreferenceSetting);

  const players = PlayersManager.getPlayers();
  const multipleTracks = !mobilePhoneMode && players.length === 2 && songPreview.tracksCount > 1;
  const initialisePlayerSetup = () =>
    players.map((player, index) => ({
      number: player.number,
      track: multipleTracks ? Math.min(index, songPreview.tracksCount - 1) : 0,
    }));
  const [playerSetup, setPlayerSetup] = useState<PlayerSetup[]>(initialisePlayerSetup());

  useEventEffect([gameEvents.playerAdded, gameEvents.playerRemoved], () => setPlayerSetup(initialisePlayerSetup()));

  const playerList = players.map(
    (player, index) => playerSetup.find((setup) => setup.number === player.number) ?? initialisePlayerSetup()[index],
  );

  const playerNames = useMemo<string[]>(
    () => JSON.parse(sessionStorage.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [],
    [],
  );

  const updatePlayer = (playerNumber: 0 | 1 | 2 | 3) => (newSetup: PlayerSetup) => {
    setPlayerSetup((current) => current.map((setup) => (setup.number === playerNumber ? newSetup : setup)));
  };

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) {
      InputManager.startMonitoring();
    }
  }, [showModal]);

  const { register, focusElement } = useKeyboardNav({
    enabled: keyboardControl && !showModal,
    onBackspace: onExitKeyboardControl,
  });

  const startSong = () => {
    onNextStep(playerList);
  };

  const areInputsConfigured = !!storedPreference && storedPreference !== 'skip';

  return (
    <>
      {showModal && (
        <SelectInputModal
          closeButtonText={areInputsConfigured ? 'Continue to the song' : 'Continue to player setup'}
          onClose={() => {
            setShowModal(false);

            if (areInputsConfigured) {
              focusElement('play');
            }
          }}
        />
      )}
      {playerList.map((setup, index) => (
        <PlayerSettingContainer key={setup.number}>
          <PlayerSettingTitle>Player {index + 1}</PlayerSettingTitle>
          <div>
            <SinglePlayer
              multipleTracks={multipleTracks}
              player={PlayersManager.getPlayer(setup.number)}
              setup={setup}
              onChange={updatePlayer(setup.number)}
              playerNames={playerNames}
              register={register}
              songPreview={songPreview}
            />
          </div>
        </PlayerSettingContainer>
      ))}
      {areInputsConfigured && (
        <PlayButton {...register('play-song-button', startSong, undefined, true)}>Play</PlayButton>
      )}
      <PlayButton {...register('select-inputs-button', () => setShowModal(true), undefined, false)}>
        Setup mics
      </PlayButton>
    </>
  );
}

const PlayerSettingContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const PlayButton = styled(Button)<{ focused: boolean }>`
  padding: 0.5rem 9rem;
  font-size: 4.3rem;
`;

const PlayerSettingTitle = styled.span`
  ${typography};
  padding: 1.3rem;
  font-size: 4.5rem;
`;
