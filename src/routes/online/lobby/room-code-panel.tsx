import { useEffect, useState } from 'react';

interface Props {
  roomCode: string;
  className?: string;
}

function getRoomLink(roomCode: string) {
  const linkObject = new URL(global.location?.href ?? 'https://allkaraoke.party/online');
  linkObject.pathname = `${import.meta.env.BASE_URL}online`;
  linkObject.search = `room=${roomCode}`;

  return linkObject.href;
}

/** The room code sitting right under the song's artist/title, with the invite link next to a copy
 * button — the same shape the remote-mic connection screen uses. */
function RoomCodePanel({ roomCode, className }: Props) {
  const [copied, setCopied] = useState(false);
  const link = getRoomLink(roomCode);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2_000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyLink = () => {
    void navigator.clipboard?.writeText(link);
    setCopied(true);
  };

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`} data-test="online-invite-link">
      <span className="typography text-xl">
        Room code:{' '}
        <strong
          className="subtle-focus ml-1 inline-flex gap-3 rounded-md px-3 py-1 uppercase"
          data-test="online-room-code">
          {roomCode.split('').map((letter, i) => (
            <span key={i}>{letter}</span>
          ))}
        </strong>
      </span>
      <div className="flex w-full items-stretch">
        <input
          className="box-border w-full border-none bg-gray-600 p-3 text-sm text-white"
          disabled
          value={link}
          data-test="online-invite-link-input"
        />
        <button
          className="bg-active typography text-md box-border cursor-pointer border-0 px-5 font-bold active:bg-black"
          onClick={copyLink}
          data-test="copy-room-link-button">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default RoomCodePanel;
