import { Menu } from 'modules/Elements/AKUI/Menu';
import { CompletedAnim } from 'modules/Elements/Menu/Heading';
import InputManager from 'modules/GameEngine/Input/InputManager';
import startViewTransition from 'modules/utils/startViewTransition';
import storage from 'modules/utils/storage';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import SelectPreference from 'routes/SelectInput/SelectPreference';
import Advanced from 'routes/SelectInput/Variants/Advanced';
import BuiltIn from 'routes/SelectInput/Variants/BuiltIn';
import DifferentMics from 'routes/SelectInput/Variants/DifferentMics';
import MultipleMics from 'routes/SelectInput/Variants/MultipleMics';
import RemoteMics from 'routes/SelectInput/Variants/RemoteMics';
import SingStarMics from 'routes/SelectInput/Variants/SingStarMics';
import Skip from 'routes/SelectInput/Variants/Skip';
import { MicSetupPreference, MicSetupPreferenceSetting, useSettingValue } from 'routes/Settings/SettingsState';
import { ValuesType } from 'utility-types';

interface Props {
  onFinish?: (pref: ValuesType<typeof MicSetupPreference>) => void;
  onBack?: () => void;
  smooth?: boolean;
  closeButtonText: string;
  skipText?: string;
  playerNames?: string[];
}

const LAST_SELECTED_KEY = 'Previously selected input type';

const previouslySelected = storage.local.getItem(LAST_SELECTED_KEY);

function SelectInputView({ onFinish, closeButtonText, onBack, skipText, smooth = true }: Props) {
  const [storedPreference, setStoredPreference] = useSettingValue(MicSetupPreferenceSetting);
  const [preference, setPreference] = useState<ValuesType<typeof MicSetupPreference> | 'multiple-mics'>(
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

  const storePreference = (preference: ValuesType<typeof MicSetupPreference> | 'multiple-mics') => {
    if (smooth && preference !== 'skip') {
      startViewTransition(() => {
        flushSync(() => {
          setPreference(preference);
        });
      });
    } else {
      setPreference(preference);
    }
  };

  const onSave = (pref: ValuesType<typeof MicSetupPreference>) => () => {
    // Keep currently selected preference unless nothing (null) is selected - then store `skip` directly
    // skip is needed to mark that user explicitly didn't select anything
    setStoredPreference(pref === 'skip' ? (storedPreference ?? 'skip') : pref);

    if (pref) {
      storage.local.setItem(LAST_SELECTED_KEY, pref);
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
      <Menu.Header>
        {isComplete ? (
          <>
            <CompletedAnim /> Setup completed!
          </>
        ) : (
          'How do you want to sing?'
        )}
      </Menu.Header>
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
      {preference === 'multiple-mics' && (
        <MultipleMics
          onSetupComplete={setIsComplete}
          onBack={back}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
      {preference === 'singstar-mics' && (
        <SingStarMics
          onSetupComplete={setIsComplete}
          onBack={back}
          onSave={onSave('singstar-mics')}
          closeButtonText={closeButtonText}
          changePreference={setPreference}
        />
      )}
      {preference === 'different-mics' && (
        <DifferentMics
          onSetupComplete={setIsComplete}
          onBack={back}
          onSave={onSave('singstar-mics')}
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
