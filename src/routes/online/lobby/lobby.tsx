import { throttle } from 'es-toolkit';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Song, SongPreview } from '~/interfaces';
import { Calibration } from '~/modules/calibration/calibration';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import { Menu } from '~/modules/elements/akui/menu';
import { useBackground } from '~/modules/elements/background-context';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import Modal from '~/modules/elements/modal';
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
import { OnlineParticipant, OnlineRoomState, SongVote } from '~/modules/online/protocol/types';
import { OnlineSongSelectionContext, OnlineSongSelectionIntegration } from '~/modules/online/song-selection-context';
import { CalibrationIntro } from '~/routes/game/singing/calibration-intro';
import CustomizeModal from '~/routes/online/lobby/customize-modal';
import HostSongPreviewCard from '~/routes/online/lobby/host-song-preview-card';
import ParticipantList from '~/routes/online/lobby/participant-list';
import PlaybackProbe from '~/routes/online/lobby/playback-probe';
import RoomConnectInstructions from '~/routes/online/lobby/room-connect-instructions';
import OnlineSongPlayersPanel from '~/routes/online/lobby/song-players-panel';
import { IsCalibratedSetting, useSettingValue } from '~/routes/settings/settings-state';
import SingASong from '~/routes/sing-a-song/sing-a-song';

interface Props {
  roomCode: string;
  roomState: OnlineRoomState;
  song: Song | null;
  songError: string | null;
}

// The lobby ↔ song-browser switch is a "scene change" — give it a slow, deliberate crossfade
const SCENE_TRANSITION_S = 2;

function Lobby({ roomCode, roomState, song, songError }: Props) {
  useBackground(true);
  const navigate = useSmoothNavigate();
  const isHost = useIsOnlineHost();
  const self = useOnlineSelf();
  const [isCalibrated, setIsCalibrated] = useSettingValue(IsCalibratedSetting);

  const [songSelectionOpen, setSongSelectionOpen] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState<'intro' | 'tool' | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<OnlineParticipant | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Disabled while any overlay owns the keyboard: the song browser (its own nav), the
  // customize modal, kick confirmation or the calibration modal — otherwise Enter presses
  // there would also trigger the lobby's remembered actions.
  const { register } = useKeyboardNav({
    enabled: !customizeOpen && calibrationStep === null && !songSelectionOpen && kickTarget === null,
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

  const onReadyClick = () => {
    if (self?.ready) {
      setReady(false);
    } else if (!isCalibrated) {
      // Everyone calibrates once before singing, exactly like the local game path
      setCalibrationStep('intro');
    } else {
      setReady(true);
    }
  };

  const confirmKick = () => {
    if (kickTarget) {
      void OnlineClient.rpc.room.kickPlayer(kickTarget.id).catch(() => undefined);
    }
    setKickTarget(null);
  };

  const everyoneReady = roomState.participants.filter((p) => p.connected).every((p) => p.ready);

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
          <MenuWithLogo>
            <Menu.Header data-test="online-lobby-header">Online Room</Menu.Header>
            <RoomConnectInstructions roomCode={roomCode} />

            <ParticipantList
              roomState={roomState}
              selfId={selfId}
              onEdit={() => setCustomizeOpen(true)}
              onKick={(participantId) =>
                setKickTarget(roomState.participants.find((p) => p.id === participantId) ?? null)
              }
            />

            <Menu.Divider />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {hostSongPreview && (
                <div className="shrink-0 sm:w-2/5">
                  <HostSongPreviewCard preview={hostSongPreview} />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {roomState.chart ? (
                  <Menu.HelpText data-test="online-selected-song">
                    Selected song:{' '}
                    <strong>
                      {roomState.chart.artist} - {roomState.chart.title}
                    </strong>
                    {!song && !songError && ' (loading…)'}
                    {songError && ` (failed to load: ${songError})`}
                  </Menu.HelpText>
                ) : (
                  <Menu.HelpText data-test="online-selected-song">
                    {isHost ? 'Pick a song to get the party going.' : 'Waiting for the host to pick a song…'}
                  </Menu.HelpText>
                )}

                {!isHost && hostSongPreview && (
                  <Menu.ButtonGroup>
                    <Menu.Button
                      {...register('online-vote-up', () => voteSong('up'))}
                      size="small"
                      className={myVote === 'up' ? '' : 'opacity-60'}
                      data-test="online-vote-up">
                      👍 Sing it!
                    </Menu.Button>
                    <Menu.Button
                      {...register('online-vote-down', () => voteSong('down'))}
                      size="small"
                      className={myVote === 'down' ? '' : 'opacity-60'}
                      data-test="online-vote-down">
                      👎 Rather not
                    </Menu.Button>
                  </Menu.ButtonGroup>
                )}

                {isHost && (
                  <Menu.Button
                    {...register('choose-song', () => setSongSelectionOpen(true))}
                    disabled={uploadState === 'uploading'}
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
                    {...register('ready-button', onReadyClick)}
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
              </div>
            </div>

            {/* Hidden playback probe: cue the video and report to the room whether it can play */}
            {self?.probe === 'pending' && song && <PlaybackProbe song={song} />}

            <Menu.Divider />
            <Menu.Button
              {...register('leave-room', () => navigate('online/', { room: null }))}
              size="small"
              data-test="leave-room-button">
              Leave room
            </Menu.Button>

            <CustomizeModal
              open={customizeOpen}
              onClose={() => setCustomizeOpen(false)}
              self={self}
              participants={roomState.participants}
            />

            <ConfirmModal
              open={kickTarget !== null}
              onClose={() => setKickTarget(null)}
              title={`Remove ${kickTarget?.name}?`}
              description="They will be removed from the room and won't be able to rejoin."
              cancelLabel="Cancel"
              confirmLabel="Remove"
              dataTestPrefix="online-kick-confirm"
              cancelButtonProps={{ onClick: () => setKickTarget(null) }}
              confirmButtonProps={{ onClick: confirmKick }}
            />

            <Modal open={calibrationStep !== null} onClose={() => setCalibrationStep(null)}>
              {calibrationStep !== null && (
                <Menu>
                  {calibrationStep === 'intro' ? (
                    <CalibrationIntro onContinue={() => setCalibrationStep('tool')} />
                  ) : (
                    <Calibration
                      onSave={() => {
                        setIsCalibrated(true);
                        setCalibrationStep(null);
                        setReady(true);
                      }}
                      onClose={() => setCalibrationStep(null)}
                    />
                  )}
                </Menu>
              )}
            </Modal>
          </MenuWithLogo>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Lobby;
