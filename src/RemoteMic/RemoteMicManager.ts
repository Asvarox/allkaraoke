import events from 'GameEvents/GameEvents';
import { SenderInterface } from 'RemoteMic/Network/Server/Transport/interface';
import { WebRTCEvents, WebRTCSetPermissionsEvent, WebRTCSubscribeEvent } from 'RemoteMic/Network/events';
import { RemoteMic } from 'RemoteMic/RemoteMicInput';
import { DefaultRemoteMicPermission } from 'Scenes/Settings/SettingsState';
import Listener from 'utils/Listener';
import storage from 'utils/storage';

const RememberedAccessesKey = 'RememberedAccessesKey';
const RememberedSubscriptionsKey = 'rememberedSubscriptionsKey';
type subscriptionChannels = WebRTCSubscribeEvent['channel'];

class RemoteMicManager extends Listener<[string, WebRTCSetPermissionsEvent['level']]> {
    private remoteMics: RemoteMic[] = [];
    private micAccessMap: Record<string, WebRTCSetPermissionsEvent['level']> =
        storage.getValue(RememberedAccessesKey) ?? {};

    private subscriptions: Record<subscriptionChannels, string[]> = storage.session.getValue(
        RememberedSubscriptionsKey,
    ) ?? { 'remote-mics': [] };

    public addRemoteMic = (id: string, name: string, connection: SenderInterface, silent: boolean) => {
        this.remoteMics = this.remoteMics.filter((remoteMic) => remoteMic.id !== id);
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

    public broadcastToChannel = (channel: subscriptionChannels, event: WebRTCEvents) => {
        this.subscriptions[channel].forEach((id) => this.getRemoteMicById(id)?.connection.send(event));
    };

    public getPermission = (id: string) => this.micAccessMap[id] ?? DefaultRemoteMicPermission.get();

    public setPermission = (id: string, permission: WebRTCSetPermissionsEvent['level']) => {
        this.getRemoteMicById(id)?.setPermission(permission);

        this.micAccessMap[id] = permission;

        storage.storeValue(RememberedAccessesKey, this.micAccessMap);
        this.onUpdate(id, permission);
    };

    public addSubscription = (id: string, channel: subscriptionChannels) => {
        this.subscriptions[channel] = [...new Set([...this.subscriptions[channel], id])];
        storage.session.storeValue(RememberedSubscriptionsKey, this.subscriptions);
        events.remoteMicSubscribed.dispatch(id, channel);
    };

    public removeSubscription = (id: string, channel: subscriptionChannels) => {
        this.subscriptions[channel] = this.subscriptions[channel]?.filter((remoteMicId) => remoteMicId !== id) ?? [];
        storage.session.storeValue(RememberedSubscriptionsKey, this.subscriptions);
    };
}

export default new RemoteMicManager();
