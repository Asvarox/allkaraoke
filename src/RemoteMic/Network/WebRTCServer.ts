import { PeerJSServerTransport, TheServer, WebSocketServerTransport } from 'RemoteMic/Network/TheServer';

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

const server = new TheServer(
    pswd && !useLegacyTransport ? new WebSocketServerTransport(pswd) : new PeerJSServerTransport(),
);

export const isWebsockets = server.transportName === 'WebSockets';
export default server;
