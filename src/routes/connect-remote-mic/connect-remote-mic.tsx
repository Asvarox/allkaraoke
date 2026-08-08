import * as qrcode from 'qrcode.react';
import { useEffect } from 'react';
import { useRoute } from 'wouter';

import CopyLinkField from '~/modules/elements/copy-link-field';
import RoomCode from '~/modules/elements/room-code';
import useQueryParam from '~/modules/hooks/use-query-param';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import buildRoomLink from '~/modules/utils/build-room-link';

const { QRCodeSVG } = qrcode;

function ConnectRemoteMic() {
  // Validate if the component is rendered in a remote mic or in the "main" game via the URL
  const [match] = useRoute('remote-mic');
  const gameCode = useQueryParam('room') ?? RemoteMicServer.getGameCode();

  const link = buildRoomLink('remote-mic', gameCode);

  useEffect(() => {
    if (!match) {
      RemoteMicServer.start();
    }
  }, [match]);

  return (
    <div className="flex flex-1 flex-row flex-nowrap items-stretch gap-8 max-[560px]:flex-col">
      <div className="mb-8 hidden max-[560px]:mb-0 max-[560px]:block">
        <span className="typography flex justify-center text-2xl">
          <RoomCode code={gameCode} />
        </span>
      </div>
      <div className="flex-[0.6] max-[560px]:flex-none">
        <QRCodeSVG value={link} width="100%" height="100%" includeMargin />
      </div>
      <div className="flex flex-1 flex-col max-[560px]:hidden">
        <div className="flex-1">
          <span className="typography mb-2.5 text-xl">
            Game code: <RoomCode code={gameCode} data-test="game-code" />
          </span>
          <ol className="mb-3 list-inside list-decimal pl-6">
            <li className="text-md leading-8 text-white">
              Go to{' '}
              <a href={new URL(link).origin} target="_blank" rel="noreferrer">
                allkaraoke.party
              </a>{' '}
              on your phone
            </li>
            <li className="text-md leading-8 text-white">
              Click on <b className="text-active typography font-bold">Join game</b>
            </li>
            <li className="text-md leading-8 text-white">
              Enter the code <RoomCode code={gameCode} />
            </li>
            <li className="text-md leading-8 text-white">Follow the instructions</li>
          </ol>
        </div>
        <div className="flex-none">
          <span className="typography text-md my-2.5">Or copy and send the link</span>
          <CopyLinkField link={link} inputDataTest="server-link-input" />
        </div>
      </div>
    </div>
  );
}

export default ConnectRemoteMic;
