import LegacyP2PClient from 'RemoteMic/Network/LegacyP2PClient';
import { PeerJSClientTransport, TheClient, WebSocketClientTransport } from 'RemoteMic/Network/TheClient';

const urlParams = new URLSearchParams(window.location.search);
const transport = urlParams.get('transport');
const legacy = urlParams.get('useLegacy');

const client: TheClient | LegacyP2PClient =
    legacy !== null
        ? new LegacyP2PClient()
        : new TheClient(transport === 'websocket' ? new WebSocketClientTransport() : new PeerJSClientTransport());

export default client;
