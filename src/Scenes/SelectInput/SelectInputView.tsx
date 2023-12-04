import { CompletedAnim, Heading } from 'Elements/Menu/Heading';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import SelectPreference from 'Scenes/SelectInput/SelectPreference';
import Advanced from 'Scenes/SelectInput/Variants/Advanced';
import BuiltIn from 'Scenes/SelectInput/Variants/BuiltIn';
import RemoteMics from 'Scenes/SelectInput/Variants/RemoteMics';
import SingStarMics from 'Scenes/SelectInput/Variants/SingStarMics';
import Skip from 'Scenes/SelectInput/Variants/Skip';
import { MicSetupPreference, MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ValuesType } from 'utility-types';
import startViewTransition from 'utils/startViewTransition';

interface Props {
  onFinish?: (pref: ValuesType<typeof MicSetupPreference>) => void;
  onBack?: () => void;
  smooth?: boolean;
  closeButtonText: string;
  skipText?: string;
  playerNames?: string[];
}

const LAST_SELECTED_KEY = 'Previously selected input type';

const previouslySelected = localStorage.getItem(LAST_SELECTED_KEY);

function SelectInputView({ onFinish, closeButtonText, playerNames, onBack, skipText, smooth = true }: Props) {
  const [storedPreference, setStoredPreference] = useSettingValue(MicSetupPreferenceSetting);
  const [preference, setPreference] = useState<ValuesType<typeof MicSetupPreference>>(
    storedPreference === 'skip' ? null : storedPreference,
  );
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const wasMonitoring = InputManager.monitoringStarted();
    InputManager.startMonitoring();
    return () => {
      !wasMonitoring && InputManager.stopMonitoring();
    };
  }, []);

  const storePreference = (...args: Parameters<typeof setPreference>) => {
    if (smooth) {
      startViewTransition(() => {
        flushSync(() => {
          setPreference(...args);
        });
      });
    } else {
      setPreference(...args);
    }
  };

  const onSave = (pref: ValuesType<typeof MicSetupPreference>) => () => {
    // Keep currently selected preference unless nothing (null) is selected - then store `skip` directly
    // skip is needed to mark that user explicitly didn't select anything
    setStoredPreference(pref === 'skip' ? storedPreference ?? 'skip' : pref);

    if (pref) {
      localStorage.setItem(LAST_SELECTED_KEY, pref);
      posthog.capture('sourcePreferenceSet', { source: pref });
    }

    onFinish?.(pref);
  };
  const back = () => {
    startViewTransition(() => {
      setPreference(null);
      setIsComplete(false);
    });
  };

  return (
    <>
      <Heading>
        {isComplete ? (
          <>
            <CompletedAnim /> Setup completed!
          </>
        ) : (
          'How do you want to sing?'
        )}
      </Heading>
      {(preference === null || preference === 'skip') && (
        <SelectPreference
          onPreferenceSelected={storePreference}
          previouslySelected={previouslySelected}
          onBack={onBack}
          skipText={skipText}
        />
      )}
      {preference === 'remoteMics' && (
        <RemoteMics
          onSetupComplete={setIsComplete}
          onBack={back}
          onSave={onSave('remoteMics')}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
      {preference === 'mics' && (
        <SingStarMics
          onSetupComplete={setIsComplete}
          onBack={back}
          onSave={onSave('mics')}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
      {preference === 'built-in' && (
        <BuiltIn
          onSetupComplete={setIsComplete}
          onBack={back}
          onSave={onSave('built-in')}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
      {preference === 'advanced' && (
        <Advanced
          onSave={onSave('advanced')}
          onSetupComplete={setIsComplete}
          onBack={back}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
      {preference === 'skip' && (
        <Skip
          onSetupComplete={setIsComplete}
          onBack={back}
          onSave={onSave('skip')}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
    </>
  );
}

export default SelectInputView;
