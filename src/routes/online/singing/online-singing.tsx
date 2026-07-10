import { useEffect, useMemo, useRef, useState } from 'react';
import { GAME_MODE, SingSetup, Song } from '~/interfaces';
import { VideoState } from '~/modules/elements/video-player/index';
import GameState from '~/modules/game-engine/game-state/game-state';
import useBlockScroll from '~/modules/hooks/use-block-scroll';
import useFullscreen from '~/modules/hooks/use-fullscreen';
import useKeyboard from '~/modules/hooks/use-keyboard';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import OnlineClient from '~/modules/online/client/online-client';
import { ONLINE_DRIFT_THRESHOLD_MS } from '~/modules/online/protocol/consts';
import { OnlinePlaybackStatus, OnlineRoomState, WireDetailedScore } from '~/modules/online/protocol/types';
import Player, { PlayerRef } from '~/routes/game/singing/player';
import LayoutGame from '~/routes/layout-game';
import LeaderboardOverlay from '~/routes/online/singing/leaderboard-overlay';
import CountdownOverlay from '~/routes/online/singing/countdown-overlay';
import PauseOverlay from '~/routes/online/singing/pause-overlay';

interface Props {
  roomState: OnlineRoomState;
  song: Song;
}

const mapVideoState = (state: VideoState): OnlinePlaybackStatus => {
  switch (state) {
    case VideoState.PLAYING:
      return 'playing';
    case VideoState.BUFFERING:
      return 'buffering';
    case VideoState.PAUSED:
    case VideoState.ENDED:
      return 'paused';
    default:
      return 'unstarted';
  }
};

/** Online singing runs the existing single-player local game path unchanged — the transferred
 * song is played as one local singer (merged track, room-assigned color). This component only
 * starts/stops playback from authoritative room commands and publishes score snapshots. */
function OnlineSinging({ roomState, song }: Props) {
  useFullscreen();
  useBlockScroll();
  const { width, height } = useViewportSize();
  const player = useRef<PlayerRef | null>(null);
  const [videoStatus, setVideoStatus] = useState(VideoState.UNSTARTED);
  const videoStatusRef = useRef(videoStatus);
  const [hasFinished, setHasFinished] = useState(false);

  const selfId = OnlineClient.getParticipantId();
  const self = roomState.participants.find((participant) => participant.id === selfId);
  // The local singer plays under their room player number so chart/lyrics colors match the room
  const selfNumber = self?.playerNumber ?? 0;
  const isHost = roomState.hostId === selfId;

  const singSetup = useMemo<SingSetup>(
    () => ({
      id: `online-${roomState.roomCode}-${roomState.chart?.hash ?? 'song'}`,
      // A single local player singing the merged full vocal line, as if singing solo
      players: [{ number: selfNumber, track: 0 }],
      mode: GAME_MODE.DUEL,
      tolerance: roomState.tolerance,
    }),
    [roomState.roomCode, roomState.chart?.hash, roomState.tolerance, selfNumber],
  );

  const isPaused = roomState.pause !== null;
  const videoGapMs = (song.videoGap ?? 0) * 1_000;
  // The room state object (and with it the anchor's identity) is re-broadcast on unrelated
  // changes — depend on the anchor's values so playback effects only run on real transitions
  const anchorServerTimeMs = roomState.playbackAnchor?.serverTimeMs ?? null;
  const anchorVideoTimeMs = roomState.playbackAnchor?.videoTimeMs ?? null;
  const appliedAnchor = useRef<number | null>(null);

  // Authoritative play/pause: follow the server's playback anchor
  useEffect(() => {
    if (hasFinished) return;
    if (isPaused || anchorServerTimeMs === null || anchorVideoTimeMs === null) {
      appliedAnchor.current = null;
      const status = videoStatusRef.current;
      if (status === VideoState.PLAYING || status === VideoState.BUFFERING) {
        player.current?.pause();
      }
      return;
    }
    if (appliedAnchor.current === anchorServerTimeMs) return;

    const localStartAt = OnlineClient.serverTimeToLocal(anchorServerTimeMs);
    const startPlaying = () => {
      appliedAnchor.current = anchorServerTimeMs;
      const positionMs = anchorVideoTimeMs + Math.max(0, Date.now() - localStartAt);
      // Resumes (or a late anchor) need a seek; the initial start is already at videoGap
      if (anchorVideoTimeMs > 0 || positionMs > ONLINE_DRIFT_THRESHOLD_MS) {
        player.current?.seekTo((videoGapMs + positionMs) / 1_000);
      }
      player.current?.play();
    };
    const delay = localStartAt - Date.now();
    if (delay > 50) {
      const timeout = setTimeout(startPlaying, delay);
      return () => clearTimeout(timeout);
    }
    startPlaying();
  }, [anchorServerTimeMs, anchorVideoTimeMs, isPaused, hasFinished, videoGapMs]);

  // Drift correction: seek when local playback strays from the room's expected position
  useEffect(() => {
    if (anchorServerTimeMs === null || anchorVideoTimeMs === null || isPaused || hasFinished) return;
    const interval = setInterval(async () => {
      if (player.current === null) return;
      if (videoStatusRef.current !== VideoState.PLAYING) {
        // Self-healing: if we're paused locally while the room is playing (e.g. a manual-pause
        // request that never reached the server), resume — otherwise we'd be stuck forever
        if (videoStatusRef.current === VideoState.PAUSED) {
          player.current.play();
        }
        return;
      }
      const currentMs = await player.current.getCurrentTime();
      const expectedMs = videoGapMs + anchorVideoTimeMs + (OnlineClient.serverNow() - anchorServerTimeMs);
      // Never seek into the last stretch of the video — seeking past the end suppresses the
      // 'ended' event on some browsers (Firefox), which would leave the song unfinished
      const durationMs = (player.current.getDuration?.() ?? 0) * 1_000;
      if (durationMs > 0 && expectedMs > durationMs - 2_000) return;
      if (expectedMs > 0 && Math.abs(currentMs - expectedMs) > ONLINE_DRIFT_THRESHOLD_MS) {
        player.current.seekTo(expectedMs / 1_000);
      }
    }, 2_000);
    return () => clearInterval(interval);
  }, [anchorServerTimeMs, anchorVideoTimeMs, isPaused, hasFinished, videoGapMs]);

  // Publish score snapshots — the locally computed score is authoritative
  useEffect(() => {
    if (anchorServerTimeMs === null || hasFinished) return;
    const interval = setInterval(() => {
      void OnlineClient.rpc.scoring.publishScore(GameState.getPlayerScore(selfNumber)).catch(() => undefined);
    }, 1_000);
    return () => clearInterval(interval);
  }, [anchorServerTimeMs, hasFinished, selfNumber]);

  const onStatusChange = (state: VideoState) => {
    setVideoStatus(state);
    videoStatusRef.current = state;
    if (hasFinished) return;
    void OnlineClient.rpc.playback.reportStatus(mapVideoState(state)).catch(() => undefined);

    // A manual pause (clicking the video, media keys) pauses the whole room, just like
    // opening the pause menu does in local play. Room-commanded pauses are excluded —
    // by the time our own player pauses for those, roomState.pause is already set.
    // The end of the video is excluded too: some browsers (Firefox) fire 'pause' right
    // before 'ended', which would otherwise pause the whole room at the finish line.
    const shouldBePlaying =
      roomState.phase === 'singing' &&
      roomState.pause === null &&
      anchorServerTimeMs !== null &&
      anchorVideoTimeMs !== null &&
      OnlineClient.serverNow() > anchorServerTimeMs + 500;
    if (state === VideoState.PAUSED && shouldBePlaying) {
      const durationMs = (player.current?.getDuration?.() ?? 0) * 1_000;
      const expectedMs = videoGapMs + anchorVideoTimeMs! + (OnlineClient.serverNow() - anchorServerTimeMs!);
      const nearEnd = durationMs > 0 && expectedMs > durationMs - 3_000;
      if (!nearEnd) {
        void OnlineClient.rpc.playback.pause().catch(() => undefined);
      }
    }
  };

  const onSongEnd = () => {
    if (hasFinished) return;
    setHasFinished(true);
    void OnlineClient.rpc.scoring.publishScore(GameState.getPlayerScore(selfNumber)).catch(() => undefined);
    void OnlineClient.rpc.scoring
      .publishFinal(GameState.getPlayerDetailedScore(selfNumber) as unknown as WireDetailedScore)
      .catch(() => undefined);
  };

  // The host ended the game — wrap up and publish the final score so the results can show
  const finishRequestedAt = roomState.finishRequestedAt;
  useEffect(() => {
    if (finishRequestedAt !== null && !hasFinished) {
      onSongEnd();
    }
  }, [finishRequestedAt, hasFinished, onSongEnd]);

  // Any connected singer can pause and any can resume
  const togglePause = () => {
    if (roomState.pause) {
      void OnlineClient.rpc.playback.resume().catch(() => undefined);
    } else if (roomState.phase === 'singing') {
      void OnlineClient.rpc.playback.pause().catch(() => undefined);
    }
  };
  useKeyboard({ back: togglePause }, !hasFinished, [roomState.pause, roomState.phase]);

  return (
    <LayoutGame>
      <div className="relative">
        {roomState.phase === 'countdown' && roomState.countdownEndsAt !== null && (
          <CountdownOverlay endsAtServerTime={roomState.countdownEndsAt} label="Starting in" />
        )}
        {roomState.pause !== null && (
          <PauseOverlay
            pause={roomState.pause}
            resumeCountdownEndsAt={roomState.resumeCountdownEndsAt}
            onResume={() => void OnlineClient.rpc.playback.resume().catch(() => undefined)}
            isHost={isHost}
            hostId={roomState.hostId}
            participants={roomState.participants}
          />
        )}
        <LeaderboardOverlay />
        {hasFinished && (
          <div
            className="typography fixed inset-x-0 top-1/3 z-30 text-center text-3xl"
            data-test="online-waiting-for-others">
            Waiting for the other singers to finish…
          </div>
        )}
        <Player
          ref={player}
          onStatusChange={onStatusChange}
          song={song}
          width={width}
          height={height}
          autoplay={false}
          onSongEnd={onSongEnd}
          singSetup={singSetup}
          // Skip intro is offered only to the host and applies to the whole room
          skipIntroEnabled={isHost}
          onSkipIntro={(targetTimeSec) =>
            void OnlineClient.rpc.playback.seek(Math.max(0, targetTimeSec * 1_000 - videoGapMs)).catch(() => undefined)
          }
        />
      </div>
    </LayoutGame>
  );
}

export default OnlineSinging;
