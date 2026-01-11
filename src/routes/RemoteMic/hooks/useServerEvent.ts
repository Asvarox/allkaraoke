import Client from 'modules/RemoteMic/Network/Client';
import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import { useEffect } from 'react';

export default function useServerEvent(callback: (message: NetworkMessages) => void, dependencies: unknown[] = []) {
  useEffect(() => {
    return Client.addListener(callback);
  }, dependencies);
}
