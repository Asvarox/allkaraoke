import { Phone } from 'RemoteMic/RemoteMicInput';
import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { InputSource } from './interfaces';
import PhoneManager from 'RemoteMic/PhoneManager';

const mapPhoneToInput = (phone: Phone): InputSource => ({
    label: `📱${phone.name}`,
    id: `${phone.id};0`,
    deviceId: phone.id,
    channels: 1,
    channel: 0,
});

export class RemoteMicrophoneInputSource {
    public static readonly inputName = 'Remote Microphone';

    public static getDefault = () => PhoneManager.getPhones().map(mapPhoneToInput)[0] ?? null;

    public static getInputs = async (): Promise<InputSource[]> => PhoneManager.getPhones().map(mapPhoneToInput);

    public static subscribeToListChange = (callback: () => void) => {
        GameStateEvents.phoneConnected.subscribe(callback);
        GameStateEvents.phoneDisconnected.subscribe(callback);
    };
    public static unsubscribeToListChange = (callback: () => void) => {
        GameStateEvents.phoneConnected.unsubscribe(callback);
        GameStateEvents.phoneDisconnected.unsubscribe(callback);
    };
}
