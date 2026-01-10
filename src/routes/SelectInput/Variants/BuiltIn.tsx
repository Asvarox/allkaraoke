import { Check, Error } from '@mui/icons-material';
import { Menu } from 'modules/Elements/AKUI/Menu';
import Loader from 'modules/Elements/Loader';
import { MenuButton } from 'modules/Elements/Menu';
import { Switcher } from 'modules/Elements/Switcher';
import { nextIndex } from 'modules/Elements/Utils/indexes';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import { getInputId } from 'modules/Players/utils';
import UserMediaEnabled from 'modules/UserMedia/UserMediaEnabled';
import { usePlayerMicData } from 'modules/hooks/players/usePlayerMic';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import { useCallback, useEffect, useRef, useState } from 'react';
import inputSourceListManager from 'routes/SelectInput/InputSources';
import { MicrophoneInputSource } from 'routes/SelectInput/InputSources/Microphone';
import MicCheck from 'routes/SelectInput/MicCheck';
import { useMicrophoneList } from 'routes/SelectInput/hooks/useMicrophoneList';
import usePlayerNumberPreset from 'routes/SelectInput/hooks/usePlayerNumberPreset';
import { MicSetupPreference } from 'routes/Settings/SettingsState';
import { ValuesType } from 'utility-types';
import { InputSource } from '../InputSources/interfaces';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
  closeButtonText: string;
}

function useIsPlayerMicAudible(inputLabel: string) {
  const [isAudible, setIsAudible] = useState<boolean | null>(null);

  const previousMeasurements = useRef<number[]>([]);
  const attempts = useRef(0);
  const onMeasure = useCallback(
    ([volume]: [number, number]) => {
      previousMeasurements.current.push(volume);
      if (previousMeasurements.current.length > 35) {
        const medianMeasurement =
          previousMeasurements.current.sort()[Math.floor(previousMeasurements.current.length / 2)];

        const audible = medianMeasurement > 0;

        if (audible || attempts.current > 7) {
          setIsAudible(audible);
        } else {
          attempts.current++;
        }

        previousMeasurements.current.length = 0;
      }
    },
    [inputLabel],
  );

  usePlayerMicData(0, onMeasure, isAudible !== true);

  useEffect(() => {
    previousMeasurements.current.length = 0;
    attempts.current = 0;
    setIsAudible(null);
  }, [inputLabel]);

  return isAudible;
}

function BuiltIn(props: Props) {
  usePlayerNumberPreset(1, 1);
  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  const { Microphone } = useMicrophoneList(true, 'Microphone');

  const selectedMic = useEventListenerSelector([events.playerInputChanged, events.inputListChanged], () => {
    const selected = PlayersManager.getInputs().find((input) => input.source === 'Microphone');
    const Mics = inputSourceListManager.getInputList().Microphone.list; // get "fresh" list from

    if (selected) {
      return Mics.find((mic) => mic.id === getInputId(selected))?.label ?? '';
    }
    return '';
  });

  const setMic = (input: InputSource) => {
    PlayersManager.getPlayers().forEach((player) =>
      player.changeInput(MicrophoneInputSource.inputName, input.channel, input.deviceId),
    );
  };

  const autoselect = () => {
    if (selectedMic === '') {
      const defaultDevice = Microphone.getDefault();
      if (defaultDevice) {
        setMic(defaultDevice);
      }
    }
  };

  useEffect(autoselect, []);
  useEventEffect([events.inputListChanged, events.playerRemoved], autoselect);

  const cycleMic = () => {
    const currentIndex = Microphone.list.findIndex((mic) => mic.label === selectedMic);

    if (currentIndex > -1) {
      const input = Microphone.list[nextIndex(Microphone.list, currentIndex)];
      setMic(input);
    }
  };
  const isAudible = useIsPlayerMicAudible(selectedMic);

  useEffect(() => {
    props.onSetupComplete(!!selectedMic && !!isAudible);
  }, [selectedMic, isAudible]);

  return (
    <>
      <UserMediaEnabled
        fallback={
          <span className="typography text-lg">
            Please allow access to the microphone so the default one can be selected.
          </span>
        }>
        {!selectedMic && <span className="typography text-lg">The default device is being selected.</span>}
        {selectedMic && (
          <>
            <div className="flex items-end justify-between">
              <span className="typography text-lg">You&#39;ll sing using</span>
              <Menu.HelpText>(click to change)</Menu.HelpText>
            </div>
            <Switcher {...register('selected-mic', cycleMic)} label="Mic" value={selectedMic} />
            <div className="flex items-center justify-end">
              {isAudible === true && (
                <>
                  <span className="typography text-lg">Microphone is audible</span>
                  <div className="flex h-8 w-10 items-center justify-end">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                </>
              )}
              {isAudible === false && (
                <>
                  <span className="typography text-lg">Microphone is not audible</span>
                  <div className="flex h-8 w-10 items-center justify-end">
                    <Error className="h-8 w-8 text-red-500" />
                  </div>
                </>
              )}
              {isAudible === null && (
                <>
                  <span className="typography text-lg">Make some noise to the microphone</span>
                  <div className="flex h-8 w-10 items-center justify-end">
                    <Loader size="1em" />
                  </div>
                </>
              )}
            </div>
            {isAudible === false && (
              <Menu.HelpText>
                Make some noise to the microphone. If that doesn&#39;t work, try using another microphone.
              </Menu.HelpText>
            )}
          </>
        )}
        <MicCheck />

        {isAudible === true && (
          <Menu.HelpText>
            Built-in microphones can pick up music from the game. For more accurate scores, try using your{' '}
            <button onClick={() => props.changePreference('remoteMics')}>smartphone as a microphone</button>.
          </Menu.HelpText>
        )}
      </UserMediaEnabled>
      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
      <MenuButton
        {...register('save-button', props.onSave, undefined, true, { disabled: !selectedMic })}
        disabled={!selectedMic}>
        {props.closeButtonText}
      </MenuButton>
    </>
  );
}

export default BuiltIn;
