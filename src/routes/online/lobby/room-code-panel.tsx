import { ReactNode } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import CopyLinkField from '~/modules/elements/copy-link-field';
import RoomCode from '~/modules/elements/room-code';
import buildRoomLink from '~/modules/utils/build-room-link';

interface Props {
  roomCode: string;
  className?: string;
  /** The way out of the room, ahead of the heading. */
  back?: ReactNode;
}

/** The room code sitting right under the song's artist/title, with the invite link next to a copy
 * button — the same shape the remote-mic connection screen uses. */
function RoomCodePanel({ roomCode, className, back }: Props) {
  const link = buildRoomLink('online', roomCode);

  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`} data-test="online-invite-link">
      <div className="flex items-center gap-3">
        {back}
        <Menu.Header className="justify-start">Room code:</Menu.Header>
        <RoomCode code={roomCode} className="typography text-xl max-lg:text-lg" data-test="online-room-code" />
      </div>
      <CopyLinkField link={link} inputDataTest="online-invite-link-input" buttonDataTest="copy-room-link-button" />
    </div>
  );
}

export default RoomCodePanel;
