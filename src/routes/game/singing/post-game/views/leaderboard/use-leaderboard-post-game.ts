import posthog from 'posthog-js';
import { useMemo, useState } from 'react';

import { SingSetup, Song } from '~/interfaces';
import GameState from '~/modules/game-engine/game-state/game-state';
import InputManager from '~/modules/game-engine/input/input-manager';
import { submitScore } from '~/modules/leaderboard/client';
import { clearIdentity, getPrefilledCountry, getPrefilledName, persistIdentity } from '~/modules/leaderboard/identity';
import { encodeNotesPayload } from '~/modules/leaderboard/notes-payload';
import { qualifiesForLeaderboard } from '~/modules/leaderboard/qualifies';
import { LeaderboardSharingSetting } from '~/modules/leaderboard/sharing';
import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import PlayersManager from '~/modules/players/players-manager';
import { useSettingValue } from '~/routes/settings/settings-state';

/**
 * What the high-scores step shows below the local scores:
 *
 * - `armed` — the player shares by default; the score goes up when they move on to the next song.
 * - `shared` — this song's score is already on its way, nothing left to do here.
 * - `opt-in` — the player declined; a way back into the prompt, and nothing else.
 * - `null` — the prompt is up, the leaderboard is off, or the score does not qualify.
 */
export type LeaderboardPanelState = 'armed' | 'shared' | 'opt-in' | null;

interface Params {
  song: Song;
  singSetup: SingSetup;
}

export default function useLeaderboardPostGame({ song, singSetup }: Params) {
  const leaderboardEnabled = useLeaderboardEnabled();
  const [sharingDecision, setSharingDecision] = useSettingValue(LeaderboardSharingSetting);

  const topPlayer = useMemo(() => {
    const players = PlayersManager.getPlayers().map((player) => ({
      number: player.number,
      name: player.getName(),
      score: GameState.getPlayerScore(player.number),
    }));

    return players.sort((first, second) => second.score - first.score)[0] ?? null;
  }, []);

  const qualifies = !!leaderboardEnabled && !!topPlayer && qualifiesForLeaderboard(topPlayer.score);

  // The prompt opens on its own only while the player has no standing decision
  const [isModalOpen, setIsModalOpen] = useState(qualifies && sharingDecision === null);
  const [alwaysShare, setAlwaysShare] = useState(sharingDecision === 'always');

  const [name, setName] = useState(() => getPrefilledName(topPlayer?.name));
  const [country, setCountry] = useState(getPrefilledCountry);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const score = Math.round(topPlayer?.score ?? 0);
  const canSubmit = qualifies && !!name.trim() && !hasSubmitted;

  const share = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !topPlayer || hasSubmitted) return;

    // Both "nothing picked" and the explicit "Prefer not to say" store no country — they are the
    // same empty-string value, see `NO_COUNTRY`
    const submittedCountry = country || null;

    persistIdentity(trimmedName, submittedCountry);
    setHasSubmitted(true);
    setIsSubmitting(true);

    const playerState = GameState.getPlayer(topPlayer.number);

    try {
      // `submitScore` swallows its own failures — awaiting it only drives the pending state
      await submitScore({
        songId: song.id,
        artist: song.artist,
        title: song.title,
        songLastUpdate: song.lastUpdate ?? null,
        score: topPlayer.score,
        tolerance: GameState.getTolerance(),
        mode: singSetup.mode,
        trackIndex: playerState?.getTrackIndex() ?? 0,
        inputLag: InputManager.getPlayerInputLag(topPlayer.number),
        name: trimmedName,
        country: submittedCountry,
        notes: encodeNotesPayload(playerState?.getPlayerNotes() ?? []),
      });
    } finally {
      setIsSubmitting(false);
    }

    // Never the name or the country — this event is analytics, the board is the only place identity goes
    posthog.capture('leaderboardSubmitted', { songId: song.id, score: topPlayer.score });
  };

  /** The modal's own submit: shares right away and records the standing decision if it was ticked. */
  const submitFromModal = () => {
    setIsModalOpen(false);
    if (alwaysShare) setSharingDecision('always');

    void share();
  };

  const dismissOnce = () => {
    setIsModalOpen(false);
    posthog.capture('leaderboardDismissed', { songId: song.id, score });
  };

  const neverAskAgain = () => {
    setIsModalOpen(false);
    setSharingDecision('never');
    posthog.capture('leaderboardOptedOut', { songId: song.id, score });
  };

  /**
   * Back to undecided rather than to `'never'`: the player is turning off automatic sharing, which
   * is not the same as never wanting to be asked. The stored name and country go with it.
   */
  const stopSharing = () => {
    setSharingDecision(null);
    setAlwaysShare(false);
    clearIdentity();
    posthog.capture('leaderboardSharingStopped', { songId: song.id });
  };

  const openModal = () => {
    setSharingDecision(null);
    setIsModalOpen(true);
  };

  const panel: LeaderboardPanelState = (() => {
    if (!qualifies || isModalOpen) return null;
    if (hasSubmitted) return 'shared';
    if (sharingDecision === 'always') return 'armed';

    // Covers both a standing "never" and a one-off dismissal — either way the only thing left to
    // offer is a way back into the prompt
    return 'opt-in';
  })();

  return {
    panel,
    isModalOpen,
    openModal,
    score,
    name,
    setName,
    country,
    setCountry,
    alwaysShare,
    setAlwaysShare,
    isSubmitting,
    canSubmit,
    share,
    submitFromModal,
    dismissOnce,
    neverAskAgain,
    stopSharing,
  };
}

export type LeaderboardPostGame = ReturnType<typeof useLeaderboardPostGame>;
