import { useState } from 'react';

import { Song } from '~/interfaces';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import { useBackground } from '~/modules/elements/background-context';
import Logo from '~/modules/elements/logo';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useBreakpoint from '~/modules/hooks/use-breakpoint';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import {
  useIsOnlineHost,
  useOnlineSelf,
  useOnlineSongPreview,
  useOnlineSongVotes,
} from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import { ONLINE_MIN_PLAYERS } from '~/modules/online/protocol/consts';
import { OnlineRoomState, SongHoverPreview, SongVote } from '~/modules/online/protocol/types';
import LayoutGame from '~/routes/layout-game';
import { SongUpload } from '~/routes/online/hooks/use-song-upload';
import ChatPanel from '~/routes/online/lobby/chat-panel';
import CustomizeModal from '~/routes/online/lobby/customize-modal';
import LobbySongCard from '~/routes/online/lobby/lobby-song-card';
import RoomLeaderboard from '~/routes/online/lobby/room-leaderboard';
import { cn } from '~/utils/cn';

interface Props {
  roomCode: string;
  roomState: OnlineRoomState;
  song: Song | null;
  songError: string | null;
  /** The transfer of the host's pick — it starts as the browser closes, so the lobby only reports it. */
  upload: SongUpload;
  /** Host only — opens the song browser (its own route, so Back comes back here). */
  onChooseSong: () => void;
}

function Lobby({ roomCode, roomState, song, songError, upload, onChooseSong }: Props) {
  useBackground(true);
  // The results screen turns the menu music on; the lobby is not a menu, so turn it back off
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const isHost = useIsOnlineHost();
  const self = useOnlineSelf();

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Disabled while the customize modal owns the keyboard — otherwise Enter presses there would also
  // trigger the lobby's remembered actions. The confirmations (leave, kick) pause this on their own.
  //
  // Spatial rather than vertical since the panels sit side by side: registration order alone would
  // chain them one after another, so arrowing would jump between columns rather than move to the
  // control drawn next to the current one.
  const { register } = useKeyboardNav({
    enabled: !customizeOpen,
    direction: 'horizontal-vertical',
  });

  // Chat and standings are each rendered once — a column of their own where there is room, inside
  // the card where there isn't. Two hidden copies would mean two subscriptions, histories, sounds.
  const breakpoint = useBreakpoint();
  const chatBesideCard = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
  const leaderboardBesideCard = breakpoint === 'xl' || breakpoint === '2xl';

  // Standings, song, chat in roughly thirds. Whole class names, as Tailwind only sees literal ones.
  const columns = leaderboardBesideCard
    ? 'grid-cols-[minmax(0,33fr)_minmax(0,39fr)_minmax(0,28fr)]'
    : chatBesideCard
      ? 'grid-cols-[minmax(0,64fr)_minmax(0,36fr)]'
      : 'grid-cols-1';
  const chat = <ChatPanel register={register} inline={!chatBesideCard} />;

  const hostSongPreview = useOnlineSongPreview();
  const votes = useOnlineSongVotes();
  const selfId = OnlineClient.getParticipantId();
  const myVote = hostSongPreview && votes[selfId]?.songId === hostSongPreview.songId ? votes[selfId].vote : null;

  const voteSong = (vote: SongVote) => {
    if (!hostSongPreview) return;
    OnlineClient.send.selection.voteSong(hostSongPreview.songId, myVote === vote ? null : vote);
  };

  // The host starts the song on their own — everyone confirms readiness on the singing screen after,
  // with the video already loaded, rather than pre-agreeing to it here
  const startGame = () => {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    void OnlineClient.rpc.room
      .startGame()
      .catch((error: unknown) => setStartError(error instanceof Error ? error.message : String(error)))
      .finally(() => setStarting(false));
  };

  // The room reports the selected song as the preview once the host stops browsing — fall back to
  // the chart anyway so the header never goes blank while that update is in flight.
  const headerPreview: SongHoverPreview | null =
    hostSongPreview ??
    (roomState.chart
      ? {
          songId: roomState.chart.songId,
          artist: roomState.chart.artist,
          title: roomState.chart.title,
          video: roomState.chart.video,
        }
      : null);

  const leaveRoom = () => {
    navigate('online/', { room: null });
  };

  // Sits next to the room code, wherever the lobby has put it at this width
  const leaveButton = (
    <ConfirmModal
      title="Leave the room?"
      description={
        isHost
          ? 'The room stays open and another singer takes over as host.'
          : "You'll need the room code to come back."
      }
      onConfirm={leaveRoom}
      dataTestPrefix="online-leave-confirm"
      cancelButton={<ConfirmModal.CancelButton name="stay-in-room">Stay in the room</ConfirmModal.CancelButton>}
      confirmButton={<ConfirmModal.ConfirmButton name="confirm-leave-room">Leave room</ConfirmModal.ConfirmButton>}>
      {(openLeaveConfirm) => {
        const {
          focused,
          $keyboardNavigationChangeFocus: _changeFocus,
          ...navProps
        } = register('leave-room', openLeaveConfirm, 'Leave room') as ReturnType<typeof register> & {
          $keyboardNavigationChangeFocus?: unknown;
        };
        // The song preview's mobile back link, so leaving reads as going back rather than as an action
        return (
          <button
            type="button"
            {...navProps}
            className={cn(
              'text-active flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md transition-colors hover:opacity-80',
              focused && 'subtle-focus -mx-2 px-2 py-1',
            )}
            data-test="leave-room-button">
            <Icon icon="ic:baseline-arrow-back" className="text-lg" />
            <span className="text-lg font-bold">Leave</span>
          </button>
        );
      }}
    </ConfirmModal>
  );

  const leaderboard = (
    <RoomLeaderboard
      roomCode={roomCode}
      roomState={roomState}
      selfId={selfId}
      register={register}
      onEdit={() => setCustomizeOpen(true)}
      inline={!leaderboardBesideCard}
      back={leaveButton}
    />
  );

  // Always the host for now — the room has no picker rotation yet
  const picker = roomState.participants.find((participant) => participant.id === roomState.hostId);
  const pickerName = picker === undefined ? null : picker.id === selfId ? 'You' : picker.name;

  // A room of one is a solo the singer could have on this device for free, while the room server
  // bills for every minute of it — so a lone host is offered local mode instead of a start. The
  // room enforces the same rule; this only saves the round trip and points at the way out.
  const connectedCount = roomState.participants.filter((participant) => participant.connected).length;
  const isAlone = connectedCount < ONLINE_MIN_PLAYERS;

  const singLocally = () => {
    // The room's pick travels along as the local list's preselection, so the song they already
    // settled on is the one focused (and added to the list even if their filters hide it) rather
    // than dropping them at the top of the list to find it again. `room: null` drops the room code
    // that the query string carries over from the lobby.
    navigate('game/', { room: null, song: roomState.chart?.songId ?? null });
  };

  return (
    // Full-screen like the main menu rather than a centred card: the side panels need that width
    <LayoutGame connectPhone={false}>
      {/* The main menu's frame, except `h-dvh` from `lg` — where this screen gains its second column */}
      <div className="flex min-h-dvh w-screen flex-col gap-4 p-4 max-lg:gap-3 max-lg:p-3 lg:h-dvh xl:gap-6 xl:p-6">
        {/* `pr-32` leaves room for the app-wide `Toolbar` fixed to this corner (see `layout-game.tsx`) */}
        <header className="flex shrink-0 items-center justify-between gap-6 pr-32">
          {/* The logo is sized in `em`: capped, and proportional to the viewport below that */}
          <div className="text-[min(13vw,5.25rem)]">
            <Logo />
          </div>
        </header>

        {/* The explicit row bounds the panels — an implicit one grows with a full room's standings
            instead of letting them scroll */}
        <div className={cn('grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-4 xl:gap-6', columns)}>
          {leaderboardBesideCard && leaderboard}

          <Menu
            // The grid sizes the card, so every breakpoint's `max-w` from `MenuContainer` is lifted
            className={cn(
              dialogSurface,
              // `min-h-0` keeps content from stretching the grid item past its row; `justify-start`
              // because centred overflowing content can't be scrolled back to its top
              'h-full min-h-0 w-full max-w-none justify-start overflow-x-hidden overflow-y-auto sm:max-w-none lg:max-w-none 2xl:max-w-none',
            )}
            data-test="online-lobby">
            <LobbySongCard
              preview={headerPreview}
              // Beside the card, the standings panel carries the invite
              roomCode={leaderboardBesideCard ? undefined : roomCode}
              back={leaderboardBesideCard ? undefined : leaveButton}
              pickerName={pickerName}
              picked={roomState.chart !== null}
              onChooseSong={isHost && !roomState.chart && upload.state !== 'uploading' ? onChooseSong : undefined}
              footer={
                <>
                  <Menu.Divider className="mb-4" />

                  {/* Folded into the card, the standings take its full width — a table needs more than 2/5 */}
                  {!leaderboardBesideCard && (
                    <>
                      {leaderboard}
                      <Menu.Divider className="my-4" />
                    </>
                  )}

                  <SongPreviewLayout.Split>
                    {(!roomState.chart || !song || songError) && (
                      <Menu.HelpText data-test="online-selected-song">
                        {!roomState.chart
                          ? isHost
                            ? 'Pick a song to get the party going.'
                            : hostSongPreview
                              ? 'The host is browsing — let them know what you think.'
                              : 'Waiting for the host to pick a song…'
                          : songError
                            ? `The song failed to load: ${songError}`
                            : 'Loading the song…'}
                      </Menu.HelpText>
                    )}

                    {/* Singers can react to whatever is on screen — the song the host is browsing and the
                        one they settled on, so the host can still be talked out of it */}
                    {!isHost && hostSongPreview && (
                      <Menu.ButtonGroup className="w-full gap-1">
                        {/* The vote is what a singer's lobby is for — leaving isn't, so the focus lands
                            here as soon as there's something to vote on */}
                        <Menu.Button
                          {...register('online-vote-up', () => voteSong('up'), undefined, true)}
                          size="small"
                          className={`flex-1 ${myVote === 'up' ? '' : 'opacity-60'}`}
                          data-test="online-vote-up">
                          <Icon icon="ic:baseline-thumb-up" size={5} className="mr-1" />
                          Sing it!
                        </Menu.Button>
                        <Menu.Button
                          {...register('online-vote-down', () => voteSong('down'))}
                          size="small"
                          className={`flex-1 ${myVote === 'down' ? '' : 'opacity-60'}`}
                          data-test="online-vote-down">
                          <Icon icon="ic:baseline-thumb-down" size={5} className="mr-1" />
                          Rather not
                        </Menu.Button>
                      </Menu.ButtonGroup>
                    )}

                    {isHost && (
                      <Menu.Button
                        {...register('choose-song', onChooseSong, undefined, !roomState.chart)}
                        disabled={upload.state === 'uploading'}
                        size={roomState.chart ? 'small' : undefined}
                        data-test="choose-song-button">
                        {upload.state === 'uploading'
                          ? 'Transferring song…'
                          : roomState.chart
                            ? 'Change song'
                            : 'Choose song'}
                      </Menu.Button>
                    )}
                    {(upload.state === 'error' || startError) && (
                      <Menu.HelpText data-test="online-upload-error">
                        {upload.state === 'error'
                          ? `Song transfer failed: ${upload.error}`
                          : `Failed to start: ${startError}`}
                      </Menu.HelpText>
                    )}

                    {/* The host's call alone — everyone else confirms they're ready once the song
                        screen is up and the video has loaded */}
                    {isHost && isAlone && (
                      <Menu.HelpText data-test="online-needs-more-singers">
                        {`Online takes at least ${ONLINE_MIN_PLAYERS} singers — share the room code above, or sing on your own in local mode.`}
                      </Menu.HelpText>
                    )}

                    {isHost &&
                      roomState.chart &&
                      song &&
                      (isAlone ? (
                        <ConfirmModal
                          title="Sing on your own?"
                          description="You're the only one in the room, and online mode is for singing together. Local mode has the same songs on this device — or stay and wait for someone to join."
                          onConfirm={singLocally}
                          dataTestPrefix="online-solo"
                          cancelButton={
                            <ConfirmModal.CancelButton name="keep-waiting">Wait for singers</ConfirmModal.CancelButton>
                          }
                          confirmButton={
                            <ConfirmModal.ConfirmButton name="sing-locally">
                              Sing in local mode
                            </ConfirmModal.ConfirmButton>
                          }>
                          {(openSoloPrompt) => (
                            <Menu.Button
                              {...register('start-song', openSoloPrompt, undefined, true)}
                              data-test="online-start-song-button"
                              disabled={!self?.connected || upload.state === 'uploading'}>
                              Start the song!
                            </Menu.Button>
                          )}
                        </ConfirmModal>
                      ) : (
                        <Menu.Button
                          {...register('start-song', startGame, undefined, true)}
                          data-test="online-start-song-button"
                          disabled={!self?.connected || upload.state === 'uploading' || starting}>
                          {starting ? 'Starting…' : 'Start the song!'}
                        </Menu.Button>
                      ))}
                    {!isHost && roomState.chart && song && (
                      <Menu.HelpText data-test="online-waiting-for-start">
                        Waiting for the host to start the song…
                      </Menu.HelpText>
                    )}

                    {!chatBesideCard && (
                      <>
                        <Menu.Divider className="mt-1" />
                        {chat}
                      </>
                    )}
                  </SongPreviewLayout.Split>
                </>
              }
            />
          </Menu>

          {chatBesideCard && chat}
        </div>
      </div>

      <CustomizeModal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        self={self}
        participants={roomState.participants}
      />
    </LayoutGame>
  );
}

export default Lobby;
