import { P2PClient } from 'RemoteMic/Network/P2PClient';
import { PeerJSTransport, TheClient, WebsocketTransport } from 'RemoteMic/Network/TheClient';

const urlParams = new URLSearchParams(window.location.search);
const transport = urlParams.get('transport');

const client: TheClient | P2PClient = new TheClient(
    transport === 'websocket' ? new WebsocketTransport() : new PeerJSTransport(),
);

export default client;
