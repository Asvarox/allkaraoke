interface Props {
  roomCode: string;
}

function RoomCode({ roomCode, ...props }: { roomCode: string }) {
  return (
    <strong className="animate-focused inline-flex gap-4 rounded-md px-4 py-1 uppercase" {...props}>
      {roomCode.split('').map((letter, i) => (
        <span key={i}>{letter}</span>
      ))}
    </strong>
  );
}

/** Same style as the remote-mic connection instructions, minus the QR code. */
function RoomConnectInstructions({ roomCode }: Props) {
  const linkObject = new URL(global.location?.href ?? 'https://allkaraoke.party/online');
  linkObject.pathname = `${import.meta.env.BASE_URL}online`;
  linkObject.search = `room=${roomCode}`;
  const link = linkObject.href;

  return (
    <div className="flex flex-col gap-2" data-test="online-invite-link">
      <span className="typography mb-2.5 text-xl">
        Room code: <RoomCode roomCode={roomCode} data-test="online-room-code" />
      </span>
      <ol className="mb-3 list-inside list-decimal pl-6">
        <li className="text-md leading-8 text-white">
          Go to{' '}
          <a href={linkObject.origin} target="_blank" rel="noreferrer">
            allkaraoke.party
          </a>{' '}
          on their device
        </li>
        <li className="text-md leading-8 text-white">
          Click on <b className="text-active typography font-bold">Sing Online</b>
        </li>
        <li className="text-md leading-8 text-white">
          Enter the code <RoomCode roomCode={roomCode} />
        </li>
      </ol>
      <div>
        <span className="typography text-md my-2.5">Or copy and send the link</span>
        <div className="flex w-full items-stretch">
          <input
            className="box-border w-full border-none bg-gray-600 p-3 text-sm text-white"
            disabled
            value={link}
            data-test="online-invite-link-input"
          />
          <button
            className="bg-active typography text-md box-border cursor-pointer border-0 px-5 font-bold active:bg-black"
            onClick={() => {
              navigator.clipboard?.writeText(link);
            }}>
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomConnectInstructions;
