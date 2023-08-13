import { NetworkServer } from 'RemoteMic/Network/Server/NetworkServer';
import { PeerJSServerTransport } from 'RemoteMic/Network/Server/Transport/PeerJSServer';
import { WebSocketServerTransport } from 'RemoteMic/Network/Server/Transport/WebSocketServer';

if (window.location.search.includes('pswd')) {
    const urlParams = new URLSearchParams(window.location.search);
    const pswd = urlParams.get('pswd');
    if (pswd) {
        window.sessionStorage.setItem('pswd', pswd);

        urlParams.delete('pswd');
        window.location.search = urlParams.toString();
    }
}
const pswd = window.sessionStorage.getItem('pswd');

const server = new NetworkServer(pswd ? new WebSocketServerTransport(pswd) : new PeerJSServerTransport());

export const isWebsockets = server.transportName === 'WebSockets';
export default server;
