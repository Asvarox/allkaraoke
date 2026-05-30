import events from '~/modules/game-events/game-events';
import { ChannelName } from '~/modules/remote-mic/network/client/subscriptions';
import { NetworkMessages } from '~/modules/remote-mic/network/messages';
import { SenderInterface } from '~/modules/remote-mic/network/server/transport/interface';
import { RemoteMic } from '~/modules/remote-mic/remote-mic-input';
import Listener from '~/modules/utils/listener';
import storage from '~/modules/utils/storage';
import { DefaultRemoteMicPermission, RemoteMicPermission } from '~/routes/settings/settings-state';

const RememberedAccessesKey = 'RememberedAccessesKey';
const RememberedSubscriptionsKey = 'rememberedSubscriptionsKey';
type subscriptionChannels = ChannelName;

class RemoteMicManager extends Listener<[string, RemoteMicPermission]> {
  private remoteMics: RemoteMic[] = [];
  private micAccessMap: Record<string, RemoteMicPermission> = storage.local?.getItem(RememberedAccessesKey) ?? {};

  private subscriptions: Record<subscriptionChannels, string[]> = {
    'remote-mics': [],
    'keyboard-layout': [],
    style: [],
    ...storage.session?.getItem(RememberedSubscriptionsKey),
  };

  public addRemoteMic = (id: string, name: string, connection: SenderInterface, silent: boolean, lag: number) => {
    this.remoteMics = this.remoteMics.filter((remoteMic) => remoteMic.id !== id);
    this.remoteMics = [...this.remoteMics, new RemoteMic(id, name, connection, lag)];
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

  public broadcast = (event: NetworkMessages) => {
    this.getRemoteMics().forEach((remoteMic) => remoteMic.connection.send(event));
  };

  public broadcastToChannel = (channel: subscriptionChannels, event: NetworkMessages) => {
    this.subscriptions[channel].forEach((id) => this.getRemoteMicById(id)?.connection.send(event));
  };

  public getPermission = (id: string) => this.micAccessMap[id] ?? DefaultRemoteMicPermission.get();

  public setPermission = (id: string, permission: RemoteMicPermission) => {
    this.getRemoteMicById(id)?.setPermission(permission);

    this.micAccessMap[id] = permission;

    storage?.setItem(RememberedAccessesKey, this.micAccessMap);
    this.onUpdate(id, permission);
  };

  public addSubscription = (id: string, channel: subscriptionChannels) => {
    this.subscriptions[channel] = [...new Set([...this.subscriptions[channel], id])];
    storage.session?.setItem(RememberedSubscriptionsKey, this.subscriptions);
  };

  public removeSubscription = (id: string, channel: subscriptionChannels) => {
    this.subscriptions[channel] = this.subscriptions[channel]?.filter((remoteMicId) => remoteMicId !== id) ?? [];
    storage.session?.setItem(RememberedSubscriptionsKey, this.subscriptions);
  };
}

export default new RemoteMicManager();
