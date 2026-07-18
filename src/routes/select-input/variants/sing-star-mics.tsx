import { useEffect, useState } from 'react';
import { ValuesType } from 'utility-types';

import { Menu } from '~/modules/elements/akui/menu';
import Loader from '~/modules/elements/loader';
import { MenuButton } from '~/modules/elements/menu';
import InputManager from '~/modules/game-engine/input/input-manager';
import events from '~/modules/game-events/game-events';
import { useEventEffect, useEventListenerSelector } from '~/modules/game-events/hooks';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import PlayersManager from '~/modules/players/players-manager';
import UserMediaEnabled from '~/modules/user-media/user-media-enabled';
import isChromium from '~/modules/utils/is-chromium';
import isWindows from '~/modules/utils/is-windows';
import { useMicrophoneList } from '~/routes/select-input/hooks/use-microphone-list';
import usePlayerNumberPreset from '~/routes/select-input/hooks/use-player-number-preset';
import InputSources from '~/routes/select-input/input-sources/index';
import { MicrophoneInputSource } from '~/routes/select-input/input-sources/microphone';
import MicCheck from '~/routes/select-input/mic-check';
import { MicSetupPreference } from '~/routes/settings/settings-state';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function SingStarMics(props: Props) {
  'use no memo'; // React Compiler: <MicCheck names={[...]} /> below is passed a fresh-but-constant array each render, so the compiler caches that element forever and MicCheck's own re-renders (driven by PlayersManager, a mutable singleton) never get triggered.
  usePlayerNumberPreset(2);
  const { register } = useKeyboardNav({ onBackspace: props.onBack });
  const { Microphone } = useMicrophoneList(true, 'Microphone');
  const [showAdvancedTip, setShowAdvancedTip] = useState(false);

  const isSetup = useEventListenerSelector([events.playerInputChanged, events.inputListChanged], () => {
    const inputs = PlayersManager.getInputs();

    const isSameDeviceId = [...new Set(inputs.map((input) => input.deviceId))].length === 1;
    const isMicInput = !inputs.find((input) => input.source !== 'Microphone');
    const areAllPreferred = !inputs.find(
      (input) => InputSources.getInputForPlayerSelected(input)?.preferred === undefined,
    );

    return isSameDeviceId && isMicInput && areAllPreferred;
  });

  useEffect(() => {
    if (isSetup) {
      InputManager.startMonitoring();
    }
    return () => {
      InputManager.stopMonitoring();
    };
  }, [isSetup]);

  const onContinue = () => {
    props.onSave();
  };

  // Look for proper microphones in the list when the list changes
  const [listChanged, setListChanged] = useState(false);
  useEventEffect(events.inputListChanged, (initial) => {
    const preferred = Microphone.list.filter((input) => input.preferred !== undefined);

    if (preferred.length === 2 && preferred[0].deviceId === preferred[1].deviceId) {
      preferred.forEach((input) => {
        PlayersManager.getPlayer(input.preferred!)?.changeInput(
          MicrophoneInputSource.inputName,
          input.channel,
          input.deviceId,
        );
      });
    }
    if (!initial) {
      setListChanged(true);
    }
  });

  useEffect(() => {
    props.onSetupComplete(isSetup);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report setup completion when the SingStar setup state changes
  }, [isSetup]);

  useEffect(() => {
    if (isSetup) {
      setShowAdvancedTip(false);
    } else {
      const timeout = setTimeout(() => setShowAdvancedTip(true), 2500);

      return () => clearTimeout(timeout);
    }
  }, [isSetup]);

  return (
    <>
      <UserMediaEnabled fallback={<h2>Please allow access to the microphone so we can find SingStar ones.</h2>}>
        {!isSetup && (
          <>
            <span className="typography block text-lg">
              <Loader /> Connect your SingStar microphones.
            </span>
            <Menu.HelpText data-test="setup-not-completed">
              It can take a couple of seconds to detect after you connect them.
            </Menu.HelpText>
            {listChanged && (
              <Menu.HelpText data-test="list-change-info">
                Available microphones list has changed, but no SingStar mics were found. Try{' '}
                <button className="text-active cursor-pointer" onClick={() => props.changePreference('advanced')}>
                  Advanced
                </button>{' '}
                setup.
              </Menu.HelpText>
            )}
            {showAdvancedTip && (
              <>
                {!listChanged && (
                  <Menu.HelpText className="bg-red-900 p-2.5" data-test="advanced-tip">
                    If they don&#39;t get detected, try{' '}
                    <button className="text-active cursor-pointer" onClick={() => props.changePreference('advanced')}>
                      Advanced
                    </button>{' '}
                    section in the previous menu.
                  </Menu.HelpText>
                )}
                {isChromium() && isWindows() && (
                  <Menu.HelpText className="bg-red-900 p-2.5">
                    <strong>Chrome</strong> is known for not handling SingStar mics well. If you notice any problems,
                    try using an alternative browser (eg. <strong>MS Edge</strong> or <strong>Firefox</strong>)
                  </Menu.HelpText>
                )}
              </>
            )}
          </>
        )}
        {isSetup && (
          <>
            <h2 data-test="setup-completed">
              <strong>SingStar</strong> microphone connected!
            </h2>

            <MicCheck names={['Blue', 'Red']} />
          </>
        )}
      </UserMediaEnabled>

      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
      <MenuButton
        {...register('save-button', onContinue, undefined, true, { disabled: !isSetup })}
        data-test="save-button">
        {props.closeButtonText}
      </MenuButton>
    </>
  );
}

export default SingStarMics;
