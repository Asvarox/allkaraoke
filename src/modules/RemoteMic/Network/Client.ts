import { NetworkClient } from '~/modules/RemoteMic/Network/Client/NetworkClient';

const client: NetworkClient = new NetworkClient();

export const serverRpc = client.rpc;

export default client;
