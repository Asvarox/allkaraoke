import { NetworkClient } from 'RemoteMic/Network/Client/NetworkClient';
import { PeerJSClientTransport } from 'RemoteMic/Network/Client/Transport/PeerJSClient';
import { WebSocketClientTransport } from 'RemoteMic/Network/Client/Transport/WebSocketClient';

const urlParams = new URLSearchParams(window.location.search);
const transport = urlParams.get('transport');

const client: NetworkClient = new NetworkClient(
  transport === 'websocket' ? new WebSocketClientTransport() : new PeerJSClientTransport(),
);

export default client;
