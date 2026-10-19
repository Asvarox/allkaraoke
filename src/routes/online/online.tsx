import { useState } from 'react';
import { Helmet } from 'react-helmet';

import { Menu } from '~/modules/elements/akui/menu';
import { Input } from '~/modules/elements/input';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import NoPrerender from '~/modules/elements/no-prerender';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { NoRemoteMics } from '~/modules/remote-mic/no-remote-mics';
import storage from '~/modules/utils/storage';
import useJoinRoomCode from '~/routes/online/hooks/use-join-room-code';
import OnlineRoom from '~/routes/online/online-room';
import OnlineSetupWizard from '~/routes/online/setup-wizard';

/** Set once the room → name → mic wizard was completed in this browser session. */
export const ONLINE_SETUP_DONE_KEY = 'ONLINE_SETUP_DONE';
/** Holds the room code this session explicitly opened (created). */
export const ONLINE_CREATED_ROOM_KEY = 'ONLINE_CREATED_ROOM';

/** The landing screen behind "Sing Online": open a new room, or type a code and join one. The code
 * is verified here, so the join wizard starts at the name step. */
function CreateOrJoin() {
  const navigate = useSmoothNavigate();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const { register } = useKeyboardNav({ enabled: mode === null, onBackspace: () => navigate('menu/') });
  const { code, setCode, checking, submit, inputRef } = useJoinRoomCode('', () => setMode('join'));

  if (mode !== null) {
    return (
      <OnlineSetupWizard
        mode={mode}
        joinRoomCode={mode === 'join' ? code.trim().toLowerCase() : null}
        codeConfirmed
        onBack={() => setMode(null)}
        onComplete={(roomCode, { create }) => {
          storage.session.setItem(ONLINE_SETUP_DONE_KEY, '1');
          if (create) {
            storage.session.setItem(ONLINE_CREATED_ROOM_KEY, roomCode);
          }
          navigate('online/', { room: roomCode });
        }}
      />
    );
  }

  return (
    <MenuWithLogo>
      <Menu.Header data-test="online-setup-header">Sing Online</Menu.Header>
      <Menu.HelpText>
        Sing together with up to 6 people, each on their own device with their own microphone.
      </Menu.HelpText>
      <Menu.Button {...register('create-room-button', () => setMode('create'))} data-test="create-room-button">
        Open a new room
      </Menu.Button>
      <Input
        {...register('online-room-code', () => undefined)}
        className="[&_input]:text-center [&_input]:tracking-[0.5rem] [&_input]:uppercase"
        label="Room code"
        value={code}
        onChange={setCode}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
        }}
        maxLength={ONLINE_ROOM_CODE_LENGTH}
        placeholder="_____"
        autoCapitalize="characters"
        autoComplete="off"
        // Locked while the room is being checked, so the code that passes is the one that is joined
        readOnly={checking}
        ref={inputRef}
        data-test="join-room-code-input"
        adornment={
          <Input.Button onClick={() => void submit()} disabled={checking} data-test="join-room-button">
            {checking ? 'Checking…' : 'Join existing room'}
          </Input.Button>
        }
      />
      <Menu.Divider />
      <Menu.Button {...register('back-button', () => navigate('menu/'))} size="small" data-test="back-button">
        Back to main menu
      </Menu.Button>
    </MenuWithLogo>
  );
}

function Online() {
  const roomCode = useQueryParam('room');

  return (
    <>
      <Helmet>
        <title>Sing Online | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      {/* Every online singer brings their own device, so there's nothing for a phone to connect to */}
      <NoRemoteMics>
        <NoPrerender>{roomCode ? <OnlineRoom roomCode={roomCode} /> : <CreateOrJoin />}</NoPrerender>
      </NoRemoteMics>
    </>
  );
}

export default Online;
