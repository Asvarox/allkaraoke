import { P2PClient } from 'RemoteMic/Network/P2PClient';
import { WebSocketsClient } from 'RemoteMic/Network/WebSocketsClient';

const urlParams = new URLSearchParams(window.location.search);
const transport = urlParams.get('transport');

const client: WebSocketsClient | P2PClient = transport === 'websocket' ? new WebSocketsClient() : new P2PClient();

export default client;
