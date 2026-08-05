import { throttle } from 'es-toolkit';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Song, SongPreview } from '~/interfaces';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import {
  useIsOnlineHost,
  useOnlineSelf,
  useOnlineSongPreview,
  useOnlineSongVotes,
} from '~/modules/online/client/hooks';
import OnlineClient from '~/modules/online/client/online-client';
import { loadSongForUpload, uploadSongToRoom } from '~/modules/online/client/song-transfer';
import { OnlineRoomState, SongHoverPreview, SongVote } from '~/modules/online/protocol/types';
import { OnlineSongSelectionContext, OnlineSongSelectionIntegration } from '~/modules/online/song-selection-context';
import useKickParticipant from '~/routes/online/hooks/use-kick-participant';
import CustomizeModal from '~/routes/online/lobby/customize-modal';
import LobbySongHeader from '~/routes/online/lobby/lobby-song-header';
import ParticipantList from '~/routes/online/lobby/participant-list';
import PlaybackProbe from '~/routes/online/lobby/playback-probe';
import OnlineSongPlayersPanel from '~/routes/online/lobby/song-players-panel';
import SingASong from '~/routes/sing-a-song/sing-a-song';

interface Props {
  roomCode: string;
  roomState: OnlineRoomState;
  song: Song | null;
  songError: string | null;
}

// Shared by the on-screen buttons and the descriptors mirrored to remote mics, so the two can't drift
const LEAVE_CANCEL_LABEL = 'Stay in the room';
const LEAVE_CONFIRM_LABEL = 'Leave room';

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
  const { isKicking, requestKick, kickModal } = useKickParticipant();
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Disabled while any overlay owns the keyboard: the song browser (its own nav), the customize
  // modal, the kick confirmation or the leave confirmation — otherwise Enter presses there would
  // also trigger the lobby's remembered actions.
  const { register } = useKeyboardNav({
    enabled: !customizeOpen && !songSelectionOpen && !isKicking && !leaveConfirmOpen,
  });

  // Keyboard nav for the leave confirmation — enabled only while it's open, so it takes control
  // over from the lobby at the same moment the lobby's nav is paused.
  const { register: registerLeave } = useKeyboardNav({
    enabled: leaveConfirmOpen,
    onBackspace: () => setLeaveConfirmOpen(false),
    direction: 'horizontal',
    title: 'Leave the room?',
  });

  // Share what the host hovers in the song browser (plus difficulty/mode) with the room
  const previewDraft = useRef<{ song?: SongPreview; difficulty?: string }>({});
  const songPreviewPublisher = useMemo(() => {
    const send = throttle(() => {
      const { song, difficulty } = previewDraft.current;
      void OnlineClient.rpc.selection
        .setPreview(
          song
            ? {
                songId: song.id,
                artist: song.artist,
                title: song.title,
                difficulty,
                mode: 'Duel',
                video: song.video,
                language: song.language,
                artistOrigin: song.artistOrigin,
                year: song.year,
                previewStart: song.previewStart ?? (song.videoGap ?? 0) + 60,
                previewEnd: song.previewEnd,
                volume: song.volume ?? song.manualVolume,
              }
            : null,
        )
        .catch(() => undefined);
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
      void OnlineClient.rpc.selection.setPreview(null).catch(() => undefined);
    }
  }, [songSelectionOpen, isHost, songPreviewPublisher]);

  const hostSongPreview = useOnlineSongPreview();
  const votes = useOnlineSongVotes();
  const selfId = OnlineClient.getParticipantId();
  const myVote = hostSongPreview && votes[selfId]?.songId === hostSongPreview.songId ? votes[selfId].vote : null;

  const voteSong = (vote: SongVote) => {
    if (!hostSongPreview) return;
    void OnlineClient.rpc.selection
      .voteSong(hostSongPreview.songId, myVote === vote ? null : vote)
      .catch(() => undefined);
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
      setUploadState('idle');
    } catch (error) {
      setUploadState('error');
      setUploadError(error instanceof Error ? error.message : String(error));
    }
  };

  const setReady = (ready: boolean) => {
    void OnlineClient.rpc.room.setReady(ready).catch(console.warn);
  };

  // Calibration already happened in the setup wizard, so readying up is a plain toggle
  const onReadyClick = () => setReady(!self?.ready);

  const everyoneReady = roomState.participants.filter((p) => p.connected).every((p) => p.ready);

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
    setLeaveConfirmOpen(false);
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
            <LobbySongHeader preview={headerPreview} roomCode={roomCode} />

            <Menu.Divider className="sm:mt-auto" />

            {/* Same split as the expanded song preview's settings row: singers on the left where the
                mic check sits, the actions on the right. */}
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:gap-12">
              <div className="w-full shrink-0 sm:w-1/2">
                <ParticipantList
                  roomState={roomState}
                  selfId={selfId}
                  onEdit={() => setCustomizeOpen(true)}
                  onKick={requestKick}
                />
              </div>

              <div className="flex w-full min-w-0 flex-1 flex-col gap-3 sm:gap-4">
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

                {roomState.chart && song && (
                  <Menu.Button
                    {...register('ready-button', onReadyClick, undefined, true)}
                    data-test="online-ready-button"
                    disabled={!self?.connected}>
                    {self?.ready ? 'Not ready after all' : 'I am ready to sing!'}
                  </Menu.Button>
                )}
                {self?.probe === 'failed' && (
                  <Menu.HelpText data-test="online-probe-failed">
                    Your device couldn&#39;t play the video — check your connection and try readying up again.
                  </Menu.HelpText>
                )}
                {everyoneReady && roomState.probeDeadline !== null && (
                  <Menu.HelpText data-test="online-probing">Checking that everyone can play the video…</Menu.HelpText>
                )}

                {/* Last in the list — leaving is the way out, not something to hit by accident */}
                <Menu.Divider className="mt-1" />
                <Menu.Button
                  {...register('leave-room', () => setLeaveConfirmOpen(true))}
                  size="small"
                  data-test="leave-room-button">
                  Leave room
                </Menu.Button>
              </div>
            </div>

            {/* Hidden playback probe: cue the video and report to the room whether it can play */}
            {self?.probe === 'pending' && song && <PlaybackProbe song={song} />}

            <CustomizeModal
              open={customizeOpen}
              onClose={() => setCustomizeOpen(false)}
              self={self}
              participants={roomState.participants}
            />

            {kickModal}

            <ConfirmModal
              open={leaveConfirmOpen}
              onClose={() => setLeaveConfirmOpen(false)}
              title="Leave the room?"
              description={
                isHost
                  ? 'The room stays open and another singer takes over as host.'
                  : "You'll need the room code to come back."
              }
              cancelLabel={LEAVE_CANCEL_LABEL}
              confirmLabel={LEAVE_CONFIRM_LABEL}
              dataTestPrefix="online-leave-confirm"
              cancelButtonProps={registerLeave(
                'stay-in-room',
                () => setLeaveConfirmOpen(false),
                LEAVE_CANCEL_LABEL,
                true,
                { control: { type: 'button', label: LEAVE_CANCEL_LABEL, variant: 'back' } },
              )}
              confirmButtonProps={registerLeave('confirm-leave-room', leaveRoom, LEAVE_CONFIRM_LABEL, false, {
                control: { type: 'button', label: LEAVE_CONFIRM_LABEL },
              })}
            />
          </MenuWithLogo>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Lobby;
