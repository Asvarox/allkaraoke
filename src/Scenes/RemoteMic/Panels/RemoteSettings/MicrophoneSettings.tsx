import { MenuButton } from 'Elements/Menu';
import RemoteMicClient from 'RemoteMic/Network/Client';
import { MIC_ID_KEY, transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import NumericInput from 'Scenes/RemoteMic/Components/NumericInput';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import { RemoteMicrophoneLagSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { useEffect, useState } from 'react';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}

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
    localStorage.removeItem('remote_mic_name');
    localStorage.removeItem(MIC_ID_KEY);
    window.location.reload();
  };
  return (
    <>
      <MenuButton onClick={reset} size="small" data-test="reset-microphone">
        Reset microphone
      </MenuButton>
      <h6>
        <strong>Note:</strong> removes all persisted microphone data (your name, ID etc.)
      </h6>
      <hr />
      <h3>Adjust microphone lag</h3>
      <NumericInput
        value={currentValue}
        onChange={changeValue}
        unit="ms"
        disabled={isLoading}
        step={25}
        data-test="microphone-delay"
      />
      <h6>Adjust the microphone input delay (e.g. if the game doesn't detect you hitting the note on time)</h6>
    </>
  );
}

export default MicrophoneSettings;
