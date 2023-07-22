import events from 'GameEvents/GameEvents';
import { WebRTCEvents, WebRTCSetPermissionsEvent } from 'RemoteMic/Network/events';
import { RemoteMic } from 'RemoteMic/RemoteMicInput';
import { DefaultRemoteMicPermission } from 'Scenes/Settings/SettingsState';
import Peer from 'peerjs';
import Listener from 'utils/Listener';
import storage from 'utils/storage';

const RememberedAccessesKey = 'RememberedAccessesKey';

class RemoteMicManager extends Listener<[string, WebRTCSetPermissionsEvent['level']]> {
    private remoteMics: RemoteMic[] = [];
    private micAccessMap: Record<string, WebRTCSetPermissionsEvent['level']> =
        storage.getValue(RememberedAccessesKey) ?? {};

    public addRemoteMic = (id: string, name: string, connection: Peer.DataConnection, silent: boolean) => {
        this.remoteMics = [...this.remoteMics, new RemoteMic(id, name, connection)];
        this.setPermission(id, this.getPermission(id));

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

    public getPermission = (id: string) => this.micAccessMap[id] ?? DefaultRemoteMicPermission.get();

    public setPermission = (id: string, permission: WebRTCSetPermissionsEvent['level']) => {
        this.getRemoteMicById(id)?.setPermission(permission);

        this.micAccessMap[id] = permission;

        storage.storeValue(RememberedAccessesKey, this.micAccessMap);
        this.onUpdate(id, permission);
    };
}

export default new RemoteMicManager();
