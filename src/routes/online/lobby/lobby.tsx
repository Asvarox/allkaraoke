import { throttle } from 'es-toolkit';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Song, SongPreview } from '~/interfaces';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import {
  useIsOnlineHost,
  useOnlineSelf,
  useOnlineSongPreview,
  useOnlineSongVotes,
} from '~/modules/online/client/hooks';
import { trackOnlineSongSelected } from '~/modules/online/client/online-analytics';
import OnlineClient from '~/modules/online/client/online-client';
import { toSongHoverPreview } from '~/modules/online/client/song-preview';
import { loadSongForUpload, uploadSongToRoom } from '~/modules/online/client/song-transfer';
import { OnlineRoomState, SongHoverPreview, SongVote } from '~/modules/online/protocol/types';
import { OnlineSongSelectionContext, OnlineSongSelectionIntegration } from '~/modules/online/song-selection-context';
import CustomizeModal from '~/routes/online/lobby/customize-modal';
import LobbySongCard from '~/routes/online/lobby/lobby-song-card';
import ParticipantList from '~/routes/online/lobby/participant-list';
import OnlineSongPlayersPanel from '~/routes/online/lobby/song-players-panel';
import SingASong from '~/routes/sing-a-song/sing-a-song';

interface Props {
  roomCode: string;
  roomState: OnlineRoomState;
  song: Song | null;
  songError: string | null;
}

// The lobby ↔ song-browser switch is a "scene change" — a crossfade rather than a cut, but never
// something to sit through
const SCENE_TRANSITION_S = 0.4;

function Lobby({ roomCode, roomState, song, songError }: Props) {
  useBackground(true);
  // The results screen turns the menu music on; the lobby is not a menu, so turn it back off
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const isHost = useIsOnlineHost();
  const self = useOnlineSelf();

  const [songSelectionOpen, setSongSelectionOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Disabled while the song browser (its own nav) or the customize modal owns the keyboard —
  // otherwise Enter presses there would also trigger the lobby's remembered actions. The
  // confirmations (leave, kick) pause this on their own.
  const { register } = useKeyboardNav({
    enabled: !customizeOpen && !songSelectionOpen,
  });

  // Share what the host hovers in the song browser (plus difficulty/mode) with the room
  const previewDraft = useRef<{ song?: SongPreview; difficulty?: string }>({});
  const songPreviewPublisher = useMemo(() => {
    const send = throttle(() => {
      const { song, difficulty } = previewDraft.current;
      OnlineClient.send.selection.setPreview(song ? toSongHoverPreview(song, difficulty) : null);
    }, 300);
    return {
      onSongFocused: (song: SongPreview | undefined) => {
        previewDraft.current = { ...previewDraft.current, song };
        send();
      },
      onSettingsChange: (song: SongPreview, difficulty: string) => {
        previewDraft.current = { song, difficulty };
        send();
      },
      cancel: send.cancel,
    };
  }, []);

  useEffect(() => {
    if (!songSelectionOpen && isHost) {
      // Left the browser — clear the shared hover (the server falls back to the selected song)
      songPreviewPublisher.cancel();
      OnlineClient.send.selection.setPreview(null);
    }
  }, [songSelectionOpen, isHost, songPreviewPublisher]);

  const hostSongPreview = useOnlineSongPreview();
  const votes = useOnlineSongVotes();
  const selfId = OnlineClient.getParticipantId();
  const myVote = hostSongPreview && votes[selfId]?.songId === hostSongPreview.songId ? votes[selfId].vote : null;

  const voteSong = (vote: SongVote) => {
    if (!hostSongPreview) return;
    OnlineClient.send.selection.voteSong(hostSongPreview.songId, myVote === vote ? null : vote);
  };

  const songSelectionIntegration = useMemo<OnlineSongSelectionIntegration>(
    () => ({
      onPreviewSettingsChange: songPreviewPublisher.onSettingsChange,
      playersView: <OnlineSongPlayersPanel />,
    }),
    [songPreviewPublisher],
  );

  const onSongSelected = async (setup: { song: SongPreview; tolerance: number }) => {
    setSongSelectionOpen(false);
    if (!isHost) return;
    setUploadState('uploading');
    setUploadError(null);
    try {
      const fullSong = await loadSongForUpload(setup.song);
      await uploadSongToRoom(fullSong, setup.tolerance, previewDraft.current.difficulty);
      trackOnlineSongSelected(setup.song.id, setup.song.artist, setup.song.title);
      setUploadState('idle');
    } catch (error) {
      setUploadState('error');
      setUploadError(error instanceof Error ? error.message : String(error));
    }
  };

  // The host starts the song on their own — everyone confirms readiness on the singing screen after,
  // with the video already loaded, rather than pre-agreeing to it here
  const startGame = () => {
    void OnlineClient.rpc.room.startGame().catch(console.warn);
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

  return (
    <AnimatePresence mode="wait">
      {songSelectionOpen ? (
        <motion.div
          key="song-browser"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: SCENE_TRANSITION_S, ease: 'easeInOut' }}>
          <OnlineSongSelectionContext.Provider value={songSelectionIntegration}>
            <SingASong
              onSongSelected={onSongSelected}
              onSongFocused={isHost ? songPreviewPublisher.onSongFocused : undefined}
              preselectedSong={roomState.chart?.songId ?? null}
            />
          </OnlineSongSelectionContext.Provider>
        </motion.div>
      ) : (
        <motion.div
          key="lobby"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: SCENE_TRANSITION_S, ease: 'easeInOut' }}>
          {/* Same card as the expanded song preview — width, background and padding included */}
          <MenuWithLogo
            className="border border-white/10 bg-slate-800 sm:min-h-[72vh] sm:max-w-[min(90vw,72rem)] lg:max-w-[min(90vw,72rem)] 2xl:max-w-[min(90vw,72rem)]"
            data-test="online-lobby">
            <LobbySongCard
              preview={headerPreview}
              roomCode={roomCode}
              onChooseSong={
                isHost && !roomState.chart && uploadState !== 'uploading' ? () => setSongSelectionOpen(true) : undefined
              }
              footer={
                <>
                  <Menu.Divider className="mb-4" />

                  {/* The same split the expanded song preview uses for its settings row: singers on
                      the left where the mic check sits, the actions on the right. */}
                  <SongPreviewLayout.Split
                    aside={
                      <ParticipantList
                        roomState={roomState}
                        selfId={selfId}
                        onEdit={() => setCustomizeOpen(true)}
                        canKick
                      />
                    }>
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
                      <Menu.ButtonGroup className="w-full gap-2">
                        <Menu.Button
                          {...register('online-vote-up', () => voteSong('up'))}
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
                        {...register('choose-song', () => setSongSelectionOpen(true), undefined, !roomState.chart)}
                        disabled={uploadState === 'uploading'}
                        size={roomState.chart ? 'small' : undefined}
                        data-test="choose-song-button">
                        {uploadState === 'uploading'
                          ? 'Transferring song…'
                          : roomState.chart
                            ? 'Change song'
                            : 'Choose song'}
                      </Menu.Button>
                    )}
                    {uploadState === 'error' && (
                      <Menu.HelpText data-test="online-upload-error">Song transfer failed: {uploadError}</Menu.HelpText>
                    )}

                    {/* The host's call alone — everyone else confirms they're ready once the song
                    screen is up and the video has loaded */}
                    {isHost && roomState.chart && song && (
                      <Menu.Button
                        {...register('start-song', startGame, undefined, true)}
                        data-test="online-start-song-button"
                        disabled={!self?.connected || uploadState === 'uploading'}>
                        Start the song!
                      </Menu.Button>
                    )}
                    {!isHost && roomState.chart && song && (
                      <Menu.HelpText data-test="online-waiting-for-start">
                        Waiting for the host to start the song…
                      </Menu.HelpText>
                    )}

                    {/* Last in the list — leaving is the way out, not something to hit by accident */}
                    <Menu.Divider className="mt-1" />
                    <ConfirmModal
                      title="Leave the room?"
                      description={
                        isHost
                          ? 'The room stays open and another singer takes over as host.'
                          : "You'll need the room code to come back."
                      }
                      onConfirm={leaveRoom}
                      dataTestPrefix="online-leave-confirm"
                      cancelButton={
                        <ConfirmModal.CancelButton name="stay-in-room">Stay in the room</ConfirmModal.CancelButton>
                      }
                      confirmButton={
                        <ConfirmModal.ConfirmButton name="confirm-leave-room">Leave room</ConfirmModal.ConfirmButton>
                      }>
                      {(openLeaveConfirm) => (
                        <Menu.Button
                          {...register('leave-room', openLeaveConfirm)}
                          size="small"
                          data-test="leave-room-button">
                          Leave room
                        </Menu.Button>
                      )}
                    </ConfirmModal>
                  </SongPreviewLayout.Split>
                </>
              }
            />

            <CustomizeModal
              open={customizeOpen}
              onClose={() => setCustomizeOpen(false)}
              self={self}
              participants={roomState.participants}
            />
          </MenuWithLogo>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Lobby;
