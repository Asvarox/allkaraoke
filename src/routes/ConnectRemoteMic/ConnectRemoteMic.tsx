import RemoteMicServer from 'modules/RemoteMic/Network/Server';
import useQueryParam from 'modules/hooks/useQueryParam';
import * as qrcode from 'qrcode.react';
import { useEffect } from 'react';
import { useRoute } from 'wouter';

const { QRCodeSVG } = qrcode;

function RoomCode({ gameCode, ...props }: { gameCode: string }) {
  return (
    <strong className="animate-focused inline-flex gap-4 rounded-md px-4 py-1 uppercase" {...props}>
      {gameCode.split('').map((letter, i) => (
        <span key={i}>{letter}</span>
      ))}
    </strong>
  );
}

function ConnectRemoteMic() {
  const linkObject = new URL(global.location?.href);

  // Validate if the component is rendered in a remote mic or in the "main" game via the URL
  const [match] = useRoute('remote-mic');
  const gameCode = useQueryParam('room') ?? RemoteMicServer.getGameCode();
  linkObject.pathname = `${import.meta.env.BASE_URL}remote-mic`;
  linkObject.search = `room=${gameCode}`;

  const link = linkObject.href;

  useEffect(() => {
    if (!match) {
      RemoteMicServer.start();
    }
  }, [match]);

  return (
    <div className="flex flex-1 flex-row flex-nowrap items-stretch gap-8 max-[560px]:flex-col">
      <div className="mb-8 hidden max-[560px]:mb-0 max-[560px]:block">
        <span className="typography flex justify-center text-2xl">
          <RoomCode gameCode={gameCode} />
        </span>
      </div>
      <div className="flex-[0.6] max-[560px]:flex-none">
        <QRCodeSVG value={link} width="100%" height="100%" includeMargin />
      </div>
      <div className="flex flex-1 flex-col max-[560px]:hidden">
        <div className="flex-1">
          <span className="typography mb-2.5 text-xl">
            Game code: <RoomCode gameCode={gameCode} data-test="game-code" />
          </span>
          <ol className="mb-3 list-inside list-decimal pl-6">
            <li className="text-md leading-8 text-white">
              Go to{' '}
              <a href={linkObject.origin} target="_blank" rel="noreferrer">
                allkaraoke.party
              </a>{' '}
              on your phone
            </li>
            <li className="text-md leading-8 text-white">
              Click on <b className="text-active typography font-bold">Join game</b>
            </li>
            <li className="text-md leading-8 text-white">
              Enter the code <RoomCode gameCode={gameCode} />
            </li>
            <li className="text-md leading-8 text-white">Follow the instructions</li>
          </ol>
        </div>
        <div className="flex-none">
          <span className="typography text-md my-2.5">Or copy and send the link</span>
          <div className="flex w-full items-stretch">
            <input
              className="box-border w-full border-none bg-gray-600 p-3 text-sm text-white"
              disabled
              value={link}
              data-test="server-link-input"
            />
            <button
              className="bg-active typography text-md box-border cursor-pointer border-0 px-5 font-bold active:bg-black"
              onClick={() => {
                navigator.clipboard.writeText(link);
              }}>
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectRemoteMic;
