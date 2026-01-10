import { Menu } from 'modules/Elements/AKUI/Menu';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { MIC_ID_KEY } from 'modules/RemoteMic/Network/Client/NetworkClient';
import storage from 'modules/utils/storage';
import { useEffect, useState } from 'react';
import NumericInput from 'routes/RemoteMic/Components/NumericInput';
import { RemoteMicrophoneLagSetting, useSettingValue } from 'routes/Settings/SettingsState';

function MicrophoneSettings() {
  const [currentValue, setCurrentValue] = useSettingValue(RemoteMicrophoneLagSetting);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    RemoteMicClient.getMicrophoneInputLag()
      .then(({ value }) => setCurrentValue(value))
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  }, []);

  const changeValue = (newValue: number) => {
    setIsLoading(true);
    RemoteMicClient.setMicrophoneInputLag(newValue)
      .then(({ value }) => setCurrentValue(value))
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  };

  const reset = () => {
    RemoteMicClient.disconnect();
    storage.local.removeItem('remote_mic_name');
    storage.local.removeItem(MIC_ID_KEY);
    global.location?.reload();
  };
  return (
    <>
      <Menu.Button onClick={reset} size="small" data-test="reset-microphone">
        Reset microphone
      </Menu.Button>
      <Menu.HelpText data-test={'reset-mic-info'}>
        <strong>Note:</strong> removes all persisted microphone data (your name, ID etc.)
      </Menu.HelpText>
      <hr />
      <Menu.SubHeader>Adjust microphone lag</Menu.SubHeader>
      <NumericInput
        value={currentValue}
        onChange={changeValue}
        unit="ms"
        disabled={isLoading}
        step={25}
        data-test="microphone-delay"
      />
      <Menu.HelpText>
        Adjust the microphone input delay (e.g. if the game doesn&#39;t detect you hitting the note on time)
      </Menu.HelpText>
    </>
  );
}

export default MicrophoneSettings;
