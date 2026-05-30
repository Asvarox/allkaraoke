import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import createPersistedState from 'use-persisted-state';
import { ValuesType } from 'utility-types';
import { v4 } from 'uuid';
import { GAME_MODE, PlayerSetup, SingSetup, SongPreview } from '~/interfaces';
import { Button } from '~/modules/elements/akui/button';
import { Switcher } from '~/modules/elements/switcher';
import InputManager from '~/modules/game-engine/input/input-manager';
import gameEvents from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import PlayersManager from '~/modules/players/players-manager';
import { nextIndex, nextValue } from '~/modules/utils/indexes';
import isDev from '~/modules/utils/is-dev';
import SelectInputModal from '~/routes/select-input/select-input-modal';
import { MicSetupPreferenceSetting, MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  songPreview: SongPreview;
  onNextStep: (setup: SingSetup) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

const gameModeNames = {
  [GAME_MODE.DUEL]: 'Duel',
  [GAME_MODE.PASS_THE_MIC]: 'Pass The Mic',
  [GAME_MODE.CO_OP]: 'Cooperation',
};

const difficultyNames = ['Hard', 'Medium', 'Easy'];

if (isDev()) {
  difficultyNames.push('Debug 4');
  difficultyNames.push('Debug 5');
  difficultyNames.push('Debug 6');
}

// added -v3 to the key as the value to handle default selection if it wasnt changed
const useSetGameMode = createPersistedState<ValuesType<typeof GAME_MODE> | null>('song_settings-game_mode-v3');
const useSetTolerance = createPersistedState<number>('song_settings-tolerance-v2');

const getTrackName = (tracks: SongPreview['tracks'], index: number) => tracks[index]?.name ?? `Track ${index + 1}`;

export default function GameSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [storedPreference] = useSettingValue(MicSetupPreferenceSetting);
  const [rememberedMode, setMode] = useSetGameMode(null);
  const mode = rememberedMode ?? (songPreview.tracksCount > 1 ? GAME_MODE.CO_OP : GAME_MODE.DUEL);
  const [tolerance, setTolerance] = useSetTolerance(1);

  const players = PlayersManager.getPlayers();
  const multipleTracks = !mobilePhoneMode && players.length === 2 && songPreview.tracksCount > 1;

  const initialisePlayerSetup = () => {
    const currentPlayers = PlayersManager.getPlayers();
    const hasMultipleTracks = !mobilePhoneMode && currentPlayers.length === 2 && songPreview.tracksCount > 1;

    return currentPlayers.map((player, index) => ({
      number: player.number,
      track: hasMultipleTracks ? Math.min(index, songPreview.tracksCount - 1) : 0,
    }));
  };
  const [playerSetup, setPlayerSetup] = useState<PlayerSetup[]>(initialisePlayerSetup());
  useEventEffect([gameEvents.playerAdded, gameEvents.playerRemoved], () => setPlayerSetup(initialisePlayerSetup()), [
    mobilePhoneMode,
    songPreview.tracksCount,
  ]);

  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (!showModal) InputManager.startMonitoring();
  }, [showModal]);

  const areInputsConfigured = !!storedPreference && storedPreference !== 'skip';

  const handlePlay = () => onNextStep({ id: v4(), players: playerSetup, mode, tolerance: tolerance + 1 });

  const changeMode = () => setMode(nextValue(Object.values(GAME_MODE), mode));
  const changeTolerance = () => setTolerance((current) => nextIndex(difficultyNames, current, -1));

  const toggleTrack = (playerNumber: 0 | 1 | 2 | 3) => () =>
    setPlayerSetup((current) =>
      current.map((s) => (s.number === playerNumber ? { ...s, track: (s.track + 1) % songPreview.tracksCount } : s)),
    );

  const { register, focusElement } = useKeyboardNav({
    enabled: keyboardControl && !showModal,
    onBackspace: onExitKeyboardControl,
    additionalHelp: { remote: ['select-song'] },
  });

  return (
    <>
      {createPortal(
        <SelectInputModal
          open={showModal}
          closeButtonText="Continue to the song"
          onClose={() => {
            setShowModal(false);
            if (areInputsConfigured) focusElement('play-song-button');
          }}
        />,
        document.body,
      )}
      <Switcher
        {...register('difficulty-setting', changeTolerance, 'Change difficulty')}
        label="Difficulty"
        value={difficultyNames[tolerance]}
        data-test-value={difficultyNames[tolerance]}
        className="w-full"
      />
      <Switcher
        {...register('game-mode-setting', changeMode, 'Change mode')}
        label="Mode"
        value={gameModeNames[mode]}
        data-test-value={gameModeNames[mode]}
        className="w-full"
      />
      <hr />
      {multipleTracks &&
        players.map((player, index) => {
          const setup = playerSetup.find((s) => s.number === player.number) ?? { track: 0 };
          return (
            <Switcher
              key={player.number}
              {...register(
                `player-${player.number}-track-setting`,
                toggleTrack(player.number as 0 | 1 | 2 | 3),
                'Change track',
              )}
              label={`P${index + 1} Track`}
              value={getTrackName(songPreview.tracks, setup.track)}
              data-test-value={setup.track + 1}
              className="w-full"
            />
          );
        })}
      {multipleTracks && <hr />}
      <Button
        {...register('select-inputs-button', () => setShowModal(true), undefined, false)}
        className="mobile:px-6"
        size="small">
        Setup mics
      </Button>
      {areInputsConfigured && (
        <Button
          size="large"
          {...register('play-song-button', handlePlay, undefined, true)}
          className="mobile:px-10 mobile:h-10 mobile:text-md px-20 py-1">
          Play
        </Button>
      )}
    </>
  );
}
