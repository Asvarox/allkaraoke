import { TheServer, WebSocketServerTransport } from 'RemoteMic/Network/TheServer';
import { P2PServer } from './P2PServer';

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
const server: TheServer | P2PServer = pswd ? new TheServer(new WebSocketServerTransport(pswd)) : new P2PServer();

export const isWebsockets = server instanceof TheServer;
export default server;
