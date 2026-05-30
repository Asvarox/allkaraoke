import events from '~/modules/game-events/game-events';
import { getInputId } from '~/modules/players/utils';
import { RemoteMic } from '~/modules/remote-mic/remote-mic-input';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import { InputSource } from './interfaces';

const mapRemoteMicToInput = (remoteMic: RemoteMic): InputSource => ({
  label: `📱${remoteMic.name}`,
  id: getInputId({ deviceId: remoteMic.id, channel: 0 }),
  deviceId: remoteMic.id,
  channels: 1,
  channel: 0,
});

export class RemoteMicrophoneInputSource {
  public static readonly inputName = 'Remote Microphone';

  public static getDefault = () => RemoteMicManager.getRemoteMics().map(mapRemoteMicToInput)[0] ?? null;

  public static getInputs = async (): Promise<InputSource[]> =>
    RemoteMicManager.getRemoteMics().map(mapRemoteMicToInput);

  public static subscribeToListChange = (callback: () => void) => {
    events.remoteMicConnected.subscribe(callback);
    events.remoteMicDisconnected.subscribe(callback);
  };
  public static unsubscribeToListChange = (callback: () => void) => {
    events.remoteMicConnected.unsubscribe(callback);
    events.remoteMicDisconnected.unsubscribe(callback);
  };
}
