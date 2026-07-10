import { useEffect, useState } from 'react';
import InputManager from '~/modules/game-engine/input/input-manager';
import OnlineClient, { OnlineConnectionStatus } from '~/modules/online/client/online-client';
import {
  LeaderboardEntry,
  OnlineRoomState,
  PlayersStats,
  SongHoverPreview,
  SongVotes,
} from '~/modules/online/protocol/types';
import { PlayerNumber } from '~/modules/players/player-number';

/** Live room state pushed by the server on the 'room-state' channel. */
export const useOnlineRoomState = (): OnlineRoomState | undefined => {
  const [state, setState] = useState<OnlineRoomState>();
  useEffect(() => OnlineClient.subscriptions.subscribe('room-state', setState), []);
  return state;
};

/** Live leaderboard pushed on the 'leaderboard' channel during singing. */
export const useOnlineLeaderboard = (): LeaderboardEntry[] => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => OnlineClient.subscriptions.subscribe('leaderboard', setLeaderboard), []);
  return leaderboard;
};

/** What the host currently hovers in the song browser, pushed on the 'song-preview' channel. */
export const useOnlineSongPreview = (): SongHoverPreview | null => {
  const [preview, setPreview] = useState<SongHoverPreview | null>(null);
  useEffect(() => OnlineClient.subscriptions.subscribe('song-preview', setPreview), []);
  return preview;
};

/** Per-participant thumbs up/down on the browsed song, pushed on the 'song-votes' channel. */
export const useOnlineSongVotes = (): SongVotes => {
  const [votes, setVotes] = useState<SongVotes>({});
  useEffect(() => OnlineClient.subscriptions.subscribe('song-votes', setVotes), []);
  return votes;
};

/** Live ping/volume per participant, pushed (coalesced) on the 'player-stats' channel. */
export const useOnlinePlayersStats = (): PlayersStats => {
  const [stats, setStats] = useState<PlayersStats>({});
  useEffect(() => OnlineClient.subscriptions.subscribe('player-stats', setStats), []);
  return stats;
};

/** Periodically reports this singer's ping and mic volume to the room. */
export const useReportPlayerStats = (enabled: boolean, playerNumber: PlayerNumber) => {
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      const volume = InputManager.getPlayerVolume(playerNumber) ?? 0;
      void OnlineClient.rpc.room.reportStats(OnlineClient.getLatency(), volume).catch(() => undefined);
    }, 1_500);
    return () => clearInterval(interval);
  }, [enabled, playerNumber]);
};

export const useOnlineConnectionStatus = (): [OnlineConnectionStatus, string | undefined] => {
  const [status, setStatus] = useState<[OnlineConnectionStatus, string | undefined]>([
    OnlineClient.getStatus(),
    undefined,
  ]);
  useEffect(
    () =>
      OnlineClient.addListener((newStatus, detail) => {
        setStatus([newStatus, detail]);
      }),
    [],
  );
  return status;
};

/** The participant entry of this browser, if connected. */
export const useOnlineSelf = () => {
  const roomState = useOnlineRoomState();
  return roomState?.participants.find((participant) => participant.id === OnlineClient.getParticipantId());
};

export const useIsOnlineHost = () => {
  const roomState = useOnlineRoomState();
  return roomState !== undefined && roomState.hostId === OnlineClient.getParticipantId();
};
