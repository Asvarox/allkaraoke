import CopyLinkField from '~/modules/elements/copy-link-field';
import RoomCode from '~/modules/elements/room-code';
import buildRoomLink from '~/modules/utils/build-room-link';

interface Props {
  roomCode: string;
  className?: string;
}

/** The room code sitting right under the song's artist/title, with the invite link next to a copy
 * button — the same shape the remote-mic connection screen uses. */
function RoomCodePanel({ roomCode, className }: Props) {
  const link = buildRoomLink('online', roomCode);

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`} data-test="online-invite-link">
      <span className="typography text-xl">
        Room code: <RoomCode code={roomCode} size="tight" className="ml-1" data-test="online-room-code" />
      </span>
      <CopyLinkField link={link} inputDataTest="online-invite-link-input" buttonDataTest="copy-room-link-button" />
    </div>
  );
}

export default RoomCodePanel;
