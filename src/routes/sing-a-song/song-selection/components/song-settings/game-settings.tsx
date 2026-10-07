import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import createPersistedState from 'use-persisted-state';
import { ValuesType } from 'utility-types';
import { v4 } from 'uuid';

import { GAME_MODE, PlayerSetup, SingSetup, SongPreview } from '~/interfaces';
import { Icon } from '~/modules/elements/akui/icon';
import { ScrollableColumn } from '~/modules/elements/akui/scrollable-container';
import { NavButton, NavRemoteControl, NavSwitcher } from '~/modules/elements/nav-controls';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import { Switcher } from '~/modules/elements/switcher';
import InputManager from '~/modules/game-engine/input/input-manager';
import gameEvents from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { gameModeNames } from '~/modules/game-modes';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import { useOnlineSongSelection } from '~/modules/online/song-selection-context';
import { PlayerNumber } from '~/modules/players/player-number';
import PlayersManager from '~/modules/players/players-manager';
import { nextIndex, nextValue } from '~/modules/utils/indexes';
import SelectInputModal from '~/routes/select-input/select-input-modal';
import { MicSetupPreferenceSetting, MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';
import { difficultyNames } from '~/routes/sing-a-song/song-selection/components/song-settings/difficulty';
import { cn } from '~/utils/cn';

interface Props {
  songPreview: SongPreview;
  /** Index into `difficultyNames`. Owned above: the leaderboard beside the settings picks it too. */
  tolerance: number;
  onToleranceChange: (tolerance: number) => void;
  onNextStep: (setup: SingSetup) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
  /** Phone-sized, where Setup mics shrinks to its icon to leave Play the room. */
  compact: boolean;
}

// added -v3 to the key as the value to handle default selection if it wasnt changed
const useSetGameMode = createPersistedState<ValuesType<typeof GAME_MODE> | null>('song_settings-game_mode-v3');

// A size down on a phone held sideways, the one layout where the settings column runs out of height
const SWITCHER_CLASS = 'w-full max-lg:landscape:h-11';

const getTrackName = (tracks: SongPreview['tracks'], index: number) => tracks[index]?.name ?? `Track ${index + 1}`;

export default function GameSettings({
  songPreview,
  tolerance,
  onToleranceChange,
  onNextStep,
  keyboardControl,
  onExitKeyboardControl,
  compact,
}: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [storedPreference] = useSettingValue(MicSetupPreferenceSetting);
  const [rememberedMode, setMode] = useSetGameMode(null);
  const online = useOnlineSongSelection();
  // Online play only supports Duel for now
  const mode = online
    ? GAME_MODE.DUEL
    : (rememberedMode ?? (songPreview.tracksCount > 1 ? GAME_MODE.CO_OP : GAME_MODE.DUEL));

  useEffect(() => {
    online?.onPreviewSettingsChange(songPreview, difficultyNames[tolerance]);
  }, [songPreview, tolerance, online]);

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
  // Opened from Play rather than Setup mics: finishing the setup goes straight into the song
  const [playAfterSetup, setPlayAfterSetup] = useState(false);
  useEffect(() => {
    if (!showModal) void InputManager.reassertMonitoring();
  }, [showModal]);

  const areInputsConfigured = !!storedPreference && storedPreference !== 'skip';
  const canPlay = areInputsConfigured || online !== null;

  const handlePlay = () => onNextStep({ id: v4(), players: playerSetup, mode, tolerance: tolerance + 1 });

  const changeMode = () => setMode(nextValue(Object.values(GAME_MODE), mode));
  const changeTolerance = () => onToleranceChange(nextIndex(difficultyNames, tolerance, -1));

  const toggleTrack = (playerNumber: PlayerNumber) => () =>
    setPlayerSetup((current) =>
      current.map((s) => (s.number === playerNumber ? { ...s, track: (s.track + 1) % songPreview.tracksCount } : s)),
    );

  const { register, focusElement } = useKeyboardNav({
    enabled: keyboardControl && !showModal,
    onBackspace: onExitKeyboardControl,
    // By position rather than by list: on wider screens Setup mics sits in the next column over
    direction: 'horizontal-vertical',
    additionalHelp: { remote: ['select-song'] },
    title: 'Song Settings',
  });

  return (
    <>
      {createPortal(
        <SelectInputModal
          open={showModal}
          closeButtonText={playAfterSetup ? 'Play' : 'Continue to the song'}
          onClose={() => {
            setShowModal(false);
            if (areInputsConfigured) focusElement('play-song-button');
          }}
          onFinish={(pref) => {
            setShowModal(false);
            if (playAfterSetup && pref !== 'skip') handlePlay();
            else focusElement('play-song-button');
          }}
        />,
        document.body,
      )}
      <KeyboardNavContext value={register}>
        {/* Scrolls only on the widest layout when short of height (a phone scrolls the whole column). The margin and
            padding pair leaves a focused switcher room to grow without being clipped by the scrollport. */}
        <ScrollableColumn
          className={cn(SongPreviewLayout.area.settings, '-mx-2')}
          contentClassName="gap-3 px-2 py-1 *:shrink-0 max-lg:landscape:gap-2 lg:landscape:min-h-auto lg:landscape:overflow-visible phone:overflow-visible">
          <NavSwitcher
            name="difficulty-setting"
            label="Difficulty"
            value={difficultyNames[tolerance]}
            data-test-value={difficultyNames[tolerance]}
            className={SWITCHER_CLASS}
            onClick={changeTolerance}
          />
          {online ? (
            // Online play is locked to Duel, so the mode is display-only — a raw Switcher keeps the
            // test id without registering a control the host can't actually change.
            <Switcher
              data-test="game-mode-setting"
              label="Mode"
              value={gameModeNames[mode]}
              data-test-value={gameModeNames[mode]}
              className={SWITCHER_CLASS}
            />
          ) : (
            <NavSwitcher
              name="game-mode-setting"
              label="Mode"
              value={gameModeNames[mode]}
              data-test-value={gameModeNames[mode]}
              className={SWITCHER_CLASS}
              onClick={changeMode}
            />
          )}
          {multipleTracks &&
            players.map((player, index) => {
              const setup = playerSetup.find((s) => s.number === player.number) ?? { track: 0 };
              return (
                <NavSwitcher
                  key={player.number}
                  name={`player-${player.number}-track-setting`}
                  label={`P${index + 1} Track`}
                  value={getTrackName(songPreview.tracks, setup.track)}
                  data-test-value={setup.track + 1}
                  className={SWITCHER_CLASS}
                  onClick={toggleTrack(player.number as PlayerNumber)}
                />
              );
            })}
        </ScrollableColumn>
        <SongPreviewLayout.Slot name="actions">
          <div className={cn(SongPreviewLayout.area.actions, 'flex gap-3 max-lg:landscape:gap-2')}>
            {!online && (
              <NavButton
                name="select-inputs-button"
                size="small"
                remoteLabel="Setup mics"
                remoteIcon="settings"
                // The gear the remote shows for it too
                leftIcon={compact ? <Icon icon="ic:baseline-settings" /> : undefined}
                // Play's height wherever the two share a row: a centre higher or lower than Play's
                // makes the other one the nearest control on that side for the arrow keys
                className={cn(
                  SongPreviewLayout.area.mics,
                  'md:portrait:h-16 max-lg:landscape:h-11 max-lg:landscape:min-w-11 lg:landscape:h-16',
                  'shrink-0 md:portrait:w-56',
                )}
                onClick={() => {
                  setPlayAfterSetup(false);
                  setShowModal(true);
                }}>
                {compact ? null : 'Setup mics'}
              </NavButton>
            )}
            <NavButton
              name="play-song-button"
              size="large"
              className={cn(
                SongPreviewLayout.area.play,
                'h-[50px] flex-1 text-lg md:portrait:h-16 md:portrait:text-xl max-lg:landscape:h-11 lg:landscape:h-16 lg:landscape:text-xl',
              )}
              remoteIcon="play"
              isDefault
              // Before the mics are set up it leads there first — Play is what anyone reaches for
              onClick={
                canPlay
                  ? handlePlay
                  : () => {
                      setPlayAfterSetup(true);
                      setShowModal(true);
                    }
              }>
              Play
            </NavButton>
          </div>
        </SongPreviewLayout.Slot>
        {/* Remote-only: the on-screen back button is pointer-only (keyboards have Backspace), so the
            phone would otherwise have no way out of this screen once mirrored. */}
        <NavRemoteControl
          name="exit-song-settings"
          control={{ type: 'button', label: 'Back to song list', variant: 'back' }}
          onClick={onExitKeyboardControl}
        />
      </KeyboardNavContext>
    </>
  );
}
