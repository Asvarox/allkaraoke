import Peer from 'peerjs';
import { WebRTCEvents } from 'RemoteMic/Network/events';
import { RemoteMic } from 'RemoteMic/RemoteMicInput';
import events from 'GameEvents/GameEvents';

class RemoteMicManager {
    private remoteMics: RemoteMic[] = [];

    public addRemoteMic = (id: string, name: string, connection: Peer.DataConnection, silent: boolean) => {
        this.remoteMics.push(new RemoteMic(id, name, connection));
        events.remoteMicConnected.dispatch({ id, name, silent });
    };

    public removeRemoteMic = (id: string, silent = false) => {
        const remoteMic = this.remoteMics.find((remoteMic) => remoteMic.id === id);
        this.remoteMics = this.remoteMics.filter((remoteMic) => remoteMic.id !== id);
        if (remoteMic) {
            remoteMic.onDisconnect();
            events.remoteMicDisconnected.dispatch(remoteMic, silent);
        }
    };

    public getRemoteMics = () => this.remoteMics;

    public getRemoteMicById = (id: string) => this.remoteMics.find((remoteMic) => remoteMic.id === id);

    public broadcast = (event: WebRTCEvents) => {
        this.getRemoteMics().forEach((remoteMic) => remoteMic.connection.send(event));
    };
}

export default new RemoteMicManager();
