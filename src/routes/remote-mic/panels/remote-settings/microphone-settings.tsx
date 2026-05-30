import { Menu } from '~/modules/elements/akui/menu';
import RemoteMicClient, { serverRpc } from '~/modules/remote-mic/network/client';
import { useServerMutation } from '~/modules/remote-mic/network/client/hooks/use-server-mutation';
import { MIC_ID_KEY } from '~/modules/remote-mic/network/client/network-client';
import storage from '~/modules/utils/storage';
import NumericInput from '~/routes/remote-mic/components/numeric-input';
import { RemoteMicrophoneLagSetting, useSettingValue } from '~/routes/settings/settings-state';

function MicrophoneSettings() {
  // Client is the source of truth — value is read from sessionStorage and sent to the server
  // on each connection via the register message, so it survives page refreshes
  const [currentValue, setCurrentValue] = useSettingValue(RemoteMicrophoneLagSetting);
  const { mutate, loading: mutating } = useServerMutation(async (newValue: number) => {
    await serverRpc.settings.setMicrophoneLag(newValue);
  });

  const handleChange = (value: number) => {
    // Persist locally first so it's sent on the next reconnect
    setCurrentValue(value);
    // Also apply immediately on the server for the current session
    void mutate(value);
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
        onChange={handleChange}
        unit="ms"
        disabled={mutating}
        step={25}
        data-test="microphone-delay"
        info="Adjust the microphone input delay (e.g. if the game doesn&#39;t detect you hitting the note on time)."
      />
    </>
  );
}

export default MicrophoneSettings;
