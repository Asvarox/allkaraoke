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
 * - `opt-in` — the player declined; a way back into the prompt, and nothing else.
 * - `null` — the prompt is up, the leaderboard is off, or the score does not qualify.
 */
export type LeaderboardPanelState = 'armed' | 'opt-in' | null;

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

  const qualifies =
    !!leaderboardEnabled && !!topPlayer && qualifiesForLeaderboard(topPlayer.score, singSetup.tolerance);

  /**
   * Derived, not seeded from the first render: `useLeaderboardEnabled` reads a PostHog flag that can
   * still be resolving at mount, and a `useState` initialiser would miss the prompt entirely for
   * that game once the flag arrived. What is tracked instead is the player having dealt with it.
   */
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const isModalOpen = qualifies && sharingDecision === null && !isPromptDismissed;

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

  /**
   * The prompt has exactly two outcomes, and both are standing decisions — there is no per-song
   * answer to give. Accepting arms this score rather than sending it on the spot, so the player
   * lands on the very panel every later song will show them, and the send happens in one place.
   */
  const acceptFromModal = () => {
    setIsPromptDismissed(true);
    setSharingDecision('always');
    posthog.capture('leaderboardOptedIn', { songId: song.id, score });
  };

  /** Closing the prompt any way at all — the button, Backspace, the backdrop — declines for good. */
  const declineFromModal = () => {
    setIsPromptDismissed(true);
    setSharingDecision('never');
    posthog.capture('leaderboardOptedOut', { songId: song.id, score });
  };

  /**
   * Back to undecided rather than to `'never'`: the player is turning off automatic sharing, which
   * is not the same as never wanting to be asked. The stored name and country go with it.
   */
  const stopSharing = () => {
    setSharingDecision(null);
    clearIdentity();
    posthog.capture('leaderboardSharingStopped', { songId: song.id });
  };

  const openModal = () => {
    setIsPromptDismissed(false);
    setSharingDecision(null);
  };

  const panel: LeaderboardPanelState = (() => {
    if (!qualifies || isModalOpen) return null;

    return sharingDecision === 'always' && !hasSubmitted ? 'armed' : 'opt-in';
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
    isSubmitting,
    canSubmit,
    share,
    acceptFromModal,
    declineFromModal,
    stopSharing,
  };
}

export type LeaderboardPostGame = ReturnType<typeof useLeaderboardPostGame>;
