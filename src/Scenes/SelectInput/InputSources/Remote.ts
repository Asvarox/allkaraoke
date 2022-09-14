import PhonesManager, { Phone } from 'Scenes/ConnectPhone/PhonesManager';
import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { InputSource } from './interfaces';

const mapPhoneToInput = (phone: Phone): InputSource => ({
    label: `📱${phone.name}`,
    id: phone.id,
    deviceId: phone.id,
    channels: 1,
    channel: 0,
});

export class RemoteMicrophoneInputSource {
    public static readonly inputName = 'Remote Microphone';

    public static getDefault = () => PhonesManager.getPhones().map(mapPhoneToInput)[0]?.id ?? null;

    public static getInputs = async (): Promise<InputSource[]> => PhonesManager.getPhones().map(mapPhoneToInput);

    public static subscribeToListChange = (callback: () => void) => {
        GameStateEvents.phoneConnected.subscribe(callback);
        GameStateEvents.phoneDisconnected.subscribe(callback);
    };
    public static unsubscribeToListChange = (callback: () => void) => {
        GameStateEvents.phoneConnected.unsubscribe(callback);
        GameStateEvents.phoneDisconnected.unsubscribe(callback);
    };
}
