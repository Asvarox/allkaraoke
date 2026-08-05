import { useState } from 'react';
import { Helmet } from 'react-helmet';

import { Menu } from '~/modules/elements/akui/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import NoPrerender from '~/modules/elements/no-prerender';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import storage from '~/modules/utils/storage';
import OnlineRoom from '~/routes/online/online-room';
import OnlineSetupWizard from '~/routes/online/setup-wizard';

/** Set once the room → name → mic wizard was completed in this browser session. */
export const ONLINE_SETUP_DONE_KEY = 'ONLINE_SETUP_DONE';
/** Holds the room code this session explicitly opened (created). */
export const ONLINE_CREATED_ROOM_KEY = 'ONLINE_CREATED_ROOM';

/** The landing screen behind "Sing Online": pick a direction, nothing else. Entering a room code
 * belongs to the join flow itself, so this screen stays down to three choices. */
function CreateOrJoin() {
  const navigate = useSmoothNavigate();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const { register } = useKeyboardNav({ enabled: mode === null, onBackspace: () => navigate('menu/') });

  if (mode !== null) {
    return (
      <OnlineSetupWizard
        mode={mode}
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
      <Menu.Button {...register('join-existing-room', () => setMode('join'))} data-test="join-existing-room-button">
        Join an existing room
      </Menu.Button>
      <Menu.Button {...register('create-room-button', () => setMode('create'))} data-test="create-room-button">
        Open a new room
      </Menu.Button>
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
      <NoPrerender>{roomCode ? <OnlineRoom roomCode={roomCode} /> : <CreateOrJoin />}</NoPrerender>
    </>
  );
}

export default Online;
