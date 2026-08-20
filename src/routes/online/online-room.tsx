import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useRoute } from 'wouter';

import { SongPreview } from '~/interfaces';
import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useMicMonitoring from '~/modules/hooks/use-mic-monitoring';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import {
  useIsOnlineHost,
  useOnlineConnectionStatus,
  useOnlineRoomState,
  useReportPlayerStats,
} from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import PlayersManager from '~/modules/players/players-manager';
import storage from '~/modules/utils/storage';
import { getStoredOnlineName } from '~/routes/online/hooks/use-online-name';
import useOnlineSong from '~/routes/online/hooks/use-online-song';
import useSongUpload from '~/routes/online/hooks/use-song-upload';
import Lobby from '~/routes/online/lobby/lobby';
import { ONLINE_CREATED_ROOM_KEY, ONLINE_SETUP_DONE_KEY } from '~/routes/online/online';
import OnlineResults from '~/routes/online/results/online-results';
import OnlineSetupWizard from '~/routes/online/setup-wizard';
import OnlineSinging from '~/routes/online/singing/online-singing';
import OnlineSongBrowser from '~/routes/online/song-browser';
import routePaths from '~/routes/route-paths';

interface Props {
  roomCode: string;
}

// Long enough to register as a handover between two full screens, short enough that the readiness
// screen is up right away
const ROOM_TRANSITION_S = 0.3;

// Opening the song browser is a "scene change" the host asked for — a slightly longer crossfade with
// a zoom, as opposed to the plain fade the room's own swaps get
const SCENE_TRANSITION_S = 0.4;

function OnlineRoom({ roomCode }: Props) {
  const navigate = useSmoothNavigate();
  // Joining via an invite link goes through the same name → mic → join wizard first
  const [setupDone, setSetupDone] = useState(() => storage.session.getItem(ONLINE_SETUP_DONE_KEY) === '1');

  useEffect(() => {
    if (!setupDone) return;
    const name = getStoredOnlineName();
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
    const previousPlayers = PlayersManager.snapshot();
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
      // Restore the pre-room roster (input, name, nameOverride and all) atomically, rather than
      // replaying removePlayer/addPlayer — which would re-trigger removePlayer's auto-add-to-minimum
      PlayersManager.restore(previousPlayers);
    };
  }, []);

  const [status, statusDetail] = useOnlineConnectionStatus();
  const roomState = useOnlineRoomState();

  // Everyone in the room keeps the mic monitored for the whole stay, re-asserted on every phase (and
  // on connecting), so the volume bars are live at the same moments for the host and the singers
  // alike. Screen-level monitoring can't do that here: the host's song-selection screen re-starts
  // monitoring as it mounts, while a singer joining through an invite link ran the setup wizard
  // inside the room and would stay on whatever input they had when the room first mounted.
  useMicMonitoring(`${status}:${roomState?.phase ?? 'none'}`);

  const selfPlayerNumber = roomState?.participants.find(
    (participant) => participant.id === OnlineClient.getParticipantId(),
  )?.playerNumber;

  useEffect(() => {
    // The room assigns each singer a color via their player number — renumber the local
    // player to match so the note chart and lyrics use the same color as the room
    if (selfPlayerNumber === undefined) return;
    PlayersManager.getPlayers().forEach((player) => {
      player.setNumber(selfPlayerNumber);
    });
  }, [selfPlayerNumber]);
  const { song, error: songError } = useOnlineSong(status === 'connected' ? roomState?.chart : null);
  useReportPlayerStats(status === 'connected', selfPlayerNumber ?? 0);

  const isHost = useIsOnlineHost();
  const [songBrowserRoute] = useRoute(routePaths.ONLINE_PICK_SONG);
  // Only the host browses songs — everyone else gets the lobby, whatever the URL says
  const isBrowsingSongs = songBrowserRoute && isHost;
  // Set once this session pushed the browser entry itself, so closing it can pop that entry instead
  // of stacking a second lobby one. False when the browser was opened by a reload or a shared link.
  const pushedSongBrowser = useRef(false);

  const openSongBrowser = () => {
    pushedSongBrowser.current = true;
    // Not smooth: the lobby ↔ browser crossfade below is the transition
    navigate('online/pick-song/', {}, { smooth: false });
  };
  const closeSongBrowser = () => {
    if (pushedSongBrowser.current) {
      pushedSongBrowser.current = false;
      // Same as the back button — the song browser only ever replaces the URL, so this lands on the lobby
      global.history.back();
    } else {
      navigate('online/', {}, { smooth: false, replace: true });
    }
  };

  // A guest on the browser URL (a shared link, or the host handing over while they browse) is shown
  // the lobby — so put the URL back to it as well
  useEffect(() => {
    if (songBrowserRoute && !isBrowsingSongs && status === 'connected' && roomState) {
      closeSongBrowser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `navigate` is a new function every render
  }, [songBrowserRoute, isBrowsingSongs, status, roomState]);

  // The chart is transferred once the host picks it, which happens as the browser is closing —
  // so it's the lobby that reports the transfer, and this has to live above both
  const upload = useSongUpload();
  const onSongPicked = (picked: SongPreview, tolerance: number, difficulty?: string) => {
    closeSongBrowser();
    void upload.upload(picked, tolerance, difficulty);
  };

  const { register } = useKeyboardNav();

  if (!setupDone) {
    return (
      <OnlineSetupWizard
        mode="join"
        joinRoomCode={roomCode}
        onBack={() => navigate('online/', { room: null })}
        onComplete={(confirmedRoomCode) => {
          storage.session.setItem(ONLINE_SETUP_DONE_KEY, '1');
          // The code step lets the singer edit the prefilled code, so it may differ from the URL's —
          // update the URL first so the connect effect below picks up the confirmed code, not the stale one
          navigate('online/', { room: confirmedRoomCode });
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

  // Readiness runs on the singing screen: the video has to be mounted and loaded while everyone
  // confirms, so it's the same view — just held before the first note
  const isSinging = (roomState.phase === 'readiness' || roomState.phase === 'singing') && song !== null;
  const isResults = roomState.phase === 'results' && !!roomState.finalResults?.length && song !== null;
  const view = isSinging ? 'singing' : isResults ? 'results' : isBrowsingSongs ? 'song-browser' : 'lobby';
  const isSceneChange = view === 'song-browser';

  // The room switches screens on its own schedule (the host starts the song and everyone's lobby is
  // replaced by the readiness screen), so the incoming screen fades in rather than cutting — being
  // yanked out of a screen you didn't click away from should at least look deliberate.
  //
  // Deliberately NOT an AnimatePresence exit: the outgoing screen is a live subtree (leaderboard
  // subscriptions, `layout` animations, the readiness and pause overlays). If any motion child in it
  // fails to report its exit as complete — which happens when one unmounts mid-exit — `mode="wait"`
  // waits forever: the old screen stays in the DOM at opacity 0, the new one never mounts, and the
  // room is stuck on an invisible, frozen screen until a reload. Dropping the old screen at once
  // costs a crossfade and cannot hang.
  return (
    <motion.div
      key={view}
      initial={{ opacity: 0, scale: isSceneChange ? 1.04 : 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: isSceneChange ? SCENE_TRANSITION_S : ROOM_TRANSITION_S, ease: 'easeInOut' }}>
      {isSinging && song ? (
        <OnlineSinging roomState={roomState} song={song} />
      ) : isResults && song ? (
        <OnlineResults roomState={roomState} song={song} />
      ) : isBrowsingSongs ? (
        <OnlineSongBrowser preselectedSong={roomState.chart?.songId ?? null} onSongSelected={onSongPicked} />
      ) : (
        <Lobby
          roomCode={roomCode}
          roomState={roomState}
          song={song}
          songError={songError}
          upload={upload}
          onChooseSong={openSongBrowser}
        />
      )}
    </motion.div>
  );
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
