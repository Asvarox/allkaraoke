import { useEffect, useState } from 'react';

import InputManager from '~/modules/game-engine/input/input-manager';
import { createSubscriptionHook } from '~/modules/network/rpc/use-subscription-factory';
import OnlineClient, { OnlineConnectionStatus } from '~/modules/online/client/online-client';
import {
  LeaderboardEntry,
  OnlineRoomState,
  PlayersStats,
  SongHoverPreview,
  SongVotes,
} from '~/modules/online/protocol/types';
import { PlayerNumber } from '~/modules/players/player-number';

/** Subscribes to one of the room's push channels and returns the latest data, or undefined before
 * the first push. The named hooks below wrap it with the per-channel default. */
export const useOnlineSubscription = createSubscriptionHook(OnlineClient.subscriptions);

// Module-level so the defaults keep the same reference across renders — the hooks used to hold them
// in state, and callers put the returned value in dependency arrays.
const NO_LEADERBOARD: LeaderboardEntry[] = [];
const NO_SONG_VOTES: SongVotes = {};
const NO_PLAYERS_STATS: PlayersStats = {};

/** Live room state pushed by the server on the 'room-state' channel. */
export const useOnlineRoomState = (): OnlineRoomState | undefined => useOnlineSubscription('room-state');

/** Live leaderboard pushed on the 'leaderboard' channel during singing. */
export const useOnlineLeaderboard = (): LeaderboardEntry[] => useOnlineSubscription('leaderboard') ?? NO_LEADERBOARD;

/** What the host currently hovers in the song browser, pushed on the 'song-preview' channel. */
export const useOnlineSongPreview = (): SongHoverPreview | null => useOnlineSubscription('song-preview') ?? null;

/** Per-participant thumbs up/down on the browsed song, pushed on the 'song-votes' channel. */
export const useOnlineSongVotes = (): SongVotes => useOnlineSubscription('song-votes') ?? NO_SONG_VOTES;

/** Live ping/volume per participant, pushed (coalesced) on the 'player-stats' channel. */
export const useOnlinePlayersStats = (): PlayersStats => useOnlineSubscription('player-stats') ?? NO_PLAYERS_STATS;

/** Periodically reports this singer's ping and mic volume to the room. */
export const useReportPlayerStats = (enabled: boolean, playerNumber: PlayerNumber) => {
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      const volume = InputManager.getPlayerVolume(playerNumber) ?? 0;
      OnlineClient.send.room.reportStats(OnlineClient.getLatency(), volume);
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
