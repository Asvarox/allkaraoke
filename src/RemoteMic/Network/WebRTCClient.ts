import { PeerJSClientTransport, TheClient, WebSocketClientTransport } from 'RemoteMic/Network/TheClient';

const urlParams = new URLSearchParams(window.location.search);
const transport = urlParams.get('transport');

const client: TheClient = new TheClient(
    transport === 'websocket' ? new WebSocketClientTransport() : new PeerJSClientTransport(),
);

export default client;
