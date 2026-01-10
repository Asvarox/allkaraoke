import { PlayerSetup, SongPreview } from 'interfaces';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { Button } from 'modules/Elements/Button';
import InputManager from 'modules/GameEngine/Input/InputManager';
import gameEvents from 'modules/GameEvents/GameEvents';
import { useEventEffect } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { PLAYER_NAMES_SESSION_STORAGE_KEY } from 'modules/hooks/players/consts';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import storage from 'modules/utils/storage';
import { AnimatePresence } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import SelectInputModal from 'routes/SelectInput/SelectInputModal';
import { MicSetupPreferenceSetting, MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';
import SinglePlayer from 'routes/SingASong/SongSelection/Components/SongSettings/PlayerSettings/SinglePlayer';

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
    () => JSON.parse(storage.session.getItem(PLAYER_NAMES_SESSION_STORAGE_KEY)!) ?? [],
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
    additionalHelp: {
      remote: ['select-song'],
    },
  });

  useEffect(() => {
    RemoteMicManager.broadcast({
      t: 'song-selection-player-settings',
    });
  }, []);

  const startSong = () => {
    onNextStep(playerList);
  };

  const areInputsConfigured = !!storedPreference && storedPreference !== 'skip';

  return (
    <>
      <AnimatePresence>
        <SelectInputModal
          open={showModal}
          closeButtonText={areInputsConfigured ? 'Continue to the song' : 'Continue to player setup'}
          onClose={() => {
            setShowModal(false);

            if (areInputsConfigured) {
              focusElement('play');
            }
          }}
        />
      </AnimatePresence>
      {playerList.map((setup, index) => (
        <div key={setup.number} className="mobile:flex-col flex flex-row justify-stretch">
          <Typography className="mobile:text-md px-3 py-1 text-right text-xl">Player {index + 1}</Typography>

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
      ))}
      {areInputsConfigured && (
        <Button
          {...register('play-song-button', startSong, undefined, true)}
          className="mobile:px-10 mobile:h-10 mobile:text-md px-20 py-1"
          size="large">
          Play
        </Button>
      )}
      <Button
        {...register('select-inputs-button', () => setShowModal(true), undefined, false)}
        className="mobile:px-10 mobile:h-10 mobile:text-md px-20 py-1"
        size="large">
        Setup mics
      </Button>
    </>
  );
}
