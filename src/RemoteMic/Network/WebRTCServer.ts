import { LegacyP2PServer } from 'RemoteMic/Network/LegacyP2PServer';
import { TheServer, WebSocketServerTransport } from 'RemoteMic/Network/TheServer';

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
if (window.location.search.includes('legacy')) {
    const urlParams = new URLSearchParams(window.location.search);
    window.sessionStorage.setItem('useLegacyTransport', 'yes');

    urlParams.delete('legacy');
    window.location.search = urlParams.toString();
}
export const useLegacyTransport = window.sessionStorage.getItem('useLegacyTransport');

const server: TheServer | LegacyP2PServer =
    pswd && !useLegacyTransport ? new TheServer(new WebSocketServerTransport(pswd)) : new LegacyP2PServer();

export const isWebsockets = server instanceof TheServer;
export default server;
