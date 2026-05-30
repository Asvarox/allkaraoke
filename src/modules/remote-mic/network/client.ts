import { NetworkClient } from '~/modules/remote-mic/network/client/network-client';

const client: NetworkClient = new NetworkClient();

export const serverRpc = client.rpc;

export default client;
