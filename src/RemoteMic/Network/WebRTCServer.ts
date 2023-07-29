import { P2PServer } from './P2PServer';
import { WebSocketsServer } from './WebSocketsServer';

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
const server: WebSocketsServer | P2PServer = pswd ? new WebSocketsServer(pswd) : new P2PServer();

export const isWebsockets = server instanceof WebSocketsServer;
export default server;
