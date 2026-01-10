import { Menu } from 'modules/Elements/AKUI/Menu';
import Loader from 'modules/Elements/Loader';
import { MenuButton } from 'modules/Elements/Menu';
import InputManager from 'modules/GameEngine/Input/InputManager';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import UserMediaEnabled from 'modules/UserMedia/UserMediaEnabled';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import isChromium from 'modules/utils/isChromium';
import isWindows from 'modules/utils/isWindows';
import { useEffect, useState } from 'react';
import InputSources from 'routes/SelectInput/InputSources';
import { MicrophoneInputSource } from 'routes/SelectInput/InputSources/Microphone';
import MicCheck from 'routes/SelectInput/MicCheck';
import { useMicrophoneList } from 'routes/SelectInput/hooks/useMicrophoneList';
import usePlayerNumberPreset from 'routes/SelectInput/hooks/usePlayerNumberPreset';
import { MicSetupPreference } from 'routes/Settings/SettingsState';
import { ValuesType } from 'utility-types';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function SingStarMics(props: Props) {
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
              <Loader size="0.85em" /> Connect your SingStar microphones.
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
