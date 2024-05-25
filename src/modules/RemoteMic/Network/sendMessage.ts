import { NetworkMessages } from 'modules/RemoteMic/Network/messages';
import { SenderInterface } from 'modules/RemoteMic/Network/Server/Transport/interface';

function sendMessage<T extends NetworkMessages>(
  connection: SenderInterface | null | undefined,
  type: T['t'],
  payload?: Omit<T, 't'>,
) {
  connection?.send({ t: type, ...payload } as NetworkMessages);
}

export default sendMessage;
