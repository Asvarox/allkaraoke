import { Helmet } from 'react-helmet';
import NoPrerender from '~/modules/elements/no-prerender';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import storage from '~/modules/utils/storage';
import OnlineRoom from '~/routes/online/online-room';
import OnlineSetupWizard from '~/routes/online/setup-wizard';

/** Set once the room → name → mic wizard was completed in this browser session. */
export const ONLINE_SETUP_DONE_KEY = 'ONLINE_SETUP_DONE';
/** Holds the room code this session explicitly opened (created). */
export const ONLINE_CREATED_ROOM_KEY = 'ONLINE_CREATED_ROOM';

function CreateOrJoin() {
  const navigate = useSmoothNavigate();

  return (
    <OnlineSetupWizard
      joinRoomCode={null}
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
