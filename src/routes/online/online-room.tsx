import { useEffect, useState } from 'react';
import { MAX_NAME_LENGTH } from '~/consts';
import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { useOnlineConnectionStatus, useOnlineRoomState, useReportPlayerStats } from '~/modules/online/client/hooks';
import OnlineClient, { ONLINE_NAME_KEY } from '~/modules/online/client/online-client';
import InputManager from '~/modules/game-engine/input/input-manager';
import PlayersManager from '~/modules/players/players-manager';
import storage from '~/modules/utils/storage';
import useOnlineSong from '~/routes/online/hooks/use-online-song';
import Lobby from '~/routes/online/lobby/lobby';
import { ONLINE_CREATED_ROOM_KEY, ONLINE_SETUP_DONE_KEY } from '~/routes/online/online';
import OnlineResults from '~/routes/online/results/online-results';
import OnlineSetupWizard from '~/routes/online/setup-wizard';
import OnlineSinging from '~/routes/online/singing/online-singing';

interface Props {
  roomCode: string;
}

function OnlineRoom({ roomCode }: Props) {
  const navigate = useSmoothNavigate();
  // Joining via an invite link goes through the same name → mic → join wizard first
  const [setupDone, setSetupDone] = useState(() => storage.session.getItem(ONLINE_SETUP_DONE_KEY) === '1');

  useEffect(() => {
    if (!setupDone) return;
    const name = (storage.getItem<string>(ONLINE_NAME_KEY) ?? '').slice(0, MAX_NAME_LENGTH);
    // Only the session that explicitly opened this room may create it — joining a
    // non-existing code gets rejected with 'not-found' instead of creating a room
    const create = storage.session.getItem(ONLINE_CREATED_ROOM_KEY) === roomCode;
    OnlineClient.connect(roomCode, name, { create });
    return () => {
      OnlineClient.disconnect();
    };
  }, [roomCode, setupDone]);

  useEffect(() => {
    // The local game path (lyrics, score display) renders from PlayersManager — online mode
    // sings solo as player 0, so trim the roster to just that player while in the room
    const previousMinPlayers = PlayersManager.getMinPlayerNumber();
    PlayersManager.setMinPlayerNumber(1);
    PlayersManager.getPlayers().forEach((player) => {
      if (player.number !== 0) {
        PlayersManager.removePlayer(player.number);
      }
    });
    if (!PlayersManager.getPlayer(0)) {
      PlayersManager.addPlayer(0);
    }
    return () => {
      PlayersManager.setMinPlayerNumber(previousMinPlayers);
      // Restore the conventional local-mode numbering when leaving the room
      PlayersManager.getPlayers().forEach((player) => {
        player.number = 0;
      });
    };
  }, []);

  useEffect(() => {
    // Keep the mic monitored for the whole room stay so volume indicators work in the lobby
    const wasMonitoring = InputManager.monitoringStarted();
    InputManager.startMonitoring();
    return () => {
      if (!wasMonitoring) {
        InputManager.stopMonitoring();
      }
    };
  }, []);

  const [status, statusDetail] = useOnlineConnectionStatus();
  const roomState = useOnlineRoomState();
  const selfPlayerNumber = roomState?.participants.find(
    (participant) => participant.id === OnlineClient.getParticipantId(),
  )?.playerNumber;

  useEffect(() => {
    // The room assigns each singer a color via their player number — renumber the local
    // player to match so the note chart and lyrics use the same color as the room
    if (selfPlayerNumber === undefined) return;
    PlayersManager.getPlayers().forEach((player) => {
      player.number = selfPlayerNumber;
    });
  }, [selfPlayerNumber]);
  const { song, error: songError } = useOnlineSong(status === 'connected' ? roomState?.chart : null);
  useReportPlayerStats(status === 'connected', selfPlayerNumber ?? 0);

  const { register } = useKeyboardNav();

  if (!setupDone) {
    return (
      <OnlineSetupWizard
        joinRoomCode={roomCode}
        onComplete={() => {
          storage.session.setItem(ONLINE_SETUP_DONE_KEY, '1');
          setSetupDone(true);
        }}
      />
    );
  }

  if (status === 'rejected') {
    return (
      <MenuWithLogo>
        <Menu.Header>Couldn&#39;t join the room</Menu.Header>
        <Menu.HelpText data-test="online-join-rejected">
          {statusDetail === 'room-full'
            ? 'This room is full (6 singers max).'
            : statusDetail === 'banned'
              ? 'You were removed from this room by the host.'
              : statusDetail === 'not-found'
                ? "This room doesn't exist — it may have expired. Check the code or open a new one."
                : (statusDetail ?? 'Unknown error')}
        </Menu.HelpText>
        <Menu.Button {...register('back-button', () => navigate('online/', { room: null }))} data-test="back-button">
          Back
        </Menu.Button>
      </MenuWithLogo>
    );
  }

  if (status !== 'connected' || !roomState) {
    return <ConnectingScreen status={status} />;
  }

  if ((roomState.phase === 'countdown' || roomState.phase === 'singing') && song) {
    return <OnlineSinging roomState={roomState} song={song} />;
  }

  if (roomState.phase === 'results' && roomState.finalResults?.length && song) {
    return <OnlineResults roomState={roomState} song={song} />;
  }

  return <Lobby roomCode={roomCode} roomState={roomState} song={song} songError={songError} />;
}

function ConnectingScreen({ status }: { status: string }) {
  useBackground(true);
  return (
    <MenuWithLogo>
      <Menu.Header>Sing Online</Menu.Header>
      <Menu.HelpText data-test="online-connection-status">
        {status === 'reconnecting' ? 'Connection lost — reconnecting…' : 'Connecting to the room…'}
      </Menu.HelpText>
    </MenuWithLogo>
  );
}

export default OnlineRoom;
