import Peer from 'peerjs';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import { Phone } from 'RemoteMic/RemoteMicInput';
import events from 'GameEvents/GameEvents';

class PhoneManager {
    private phones: Phone[] = [];
    private readinessRequestPromise: Promise<boolean> | null = null;

    public addPhone = (id: string, name: string, connection: Peer.DataConnection, silent: boolean) => {
        this.phones.push(new Phone(id, name, connection));
        events.phoneConnected.dispatch({ id, name, silent });
    };

    public removePhone = (id: string, silent = false) => {
        const removedPhone = this.phones.find((phone) => phone.id === id);
        this.phones = this.phones.filter((phone) => phone.id !== id);
        if (removedPhone) events.phoneDisconnected.dispatch(removedPhone, silent);
    };

    public getPhones = () => this.phones;

    public getPhoneById = (id: string) => this.phones.find((phone) => phone.id === id);

    public broadcast = (event: WebRTCEvents) => {
        this.getPhones().forEach((phone) => phone.connection.send(event));
    };
}

export default new PhoneManager();
