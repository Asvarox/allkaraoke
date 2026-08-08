import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import Typography from '~/modules/elements/akui/primitives/typography';
import Loader from '~/modules/elements/loader';
import { MenuButton } from '~/modules/elements/menu';
import useKeyboard from '~/modules/hooks/use-keyboard';
import OnlineClient from '~/modules/online/client/online-client';
import { OnlineParticipant } from '~/modules/online/protocol/types';
import { waitFinished, waitForReadinessMusic } from '~/modules/sound-manager';
import ParticipantSlot from '~/routes/online/components/participant-slot';

interface Props {
  participants: OnlineParticipant[];
  selfId: string;
  hostId: string | null;
  /** Server timestamp the song starts at regardless of who has confirmed. */
  readinessDeadline: number | null;
  isHost: boolean;
  /** The room has committed to starting and is only holding the video for the lead-in — nothing is
   * being waited for any more, so the prompts drop away and just the singer rows are left, exactly
   * as the local game's wait collapses before the first note. */
  starting: boolean;
}

/** Kept in step with READINESS_OUTRO_HOLD_MS in online-singing.tsx: hold + fade < ONLINE_START_LEAD_MS. */
const READINESS_EXIT_S = 0.7;

/**
 * The online counterpart of the local game's `WaitForReadiness`: the song screen is already up with
 * the video loaded and held, and every singer confirms on their own device. Same shape as the local
 * one — a row per singer with a tick once they've confirmed, and an autostart counting down for
 * whoever walked away from their keyboard.
 */
function ReadinessOverlay({ participants, selfId, hostId, readinessDeadline, isHost, starting }: Props) {
  const connected = participants.filter((participant) => participant.connected);
  const self = participants.find((participant) => participant.id === selfId);
  const everyoneReady = starting || (connected.length > 0 && connected.every((participant) => participant.ready));

  const confirm = () => {
    if (self?.ready) return;
    void OnlineClient.rpc.room.setReady(true).catch(console.warn);
  };
  useKeyboard({ accept: confirm }, !self?.ready, [self?.ready]);

  // Same music the local game plays while it waits, and the same sting when the wait is over
  useEffect(() => {
    if (everyoneReady) return;
    void waitForReadinessMusic.play(false);
    return () => {
      if (waitForReadinessMusic.playing()) waitFinished.play();
      waitForReadinessMusic.stop();
    };
  }, [everyoneReady]);

  const [remainingS, setRemainingS] = useState<number | null>(null);
  useEffect(() => {
    if (readinessDeadline === null) return;
    const tick = () =>
      setRemainingS(Math.max(0, Math.ceil((OnlineClient.serverTimeToLocal(readinessDeadline) - Date.now()) / 1_000)));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [readinessDeadline]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: READINESS_EXIT_S }}
      className="typography fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/70 text-xl backdrop-blur-sm"
      data-test="online-readiness">
      {!everyoneReady && (
        <Typography className="text-center text-2xl">
          Waiting for all singers to click <strong>&quot;Ready&quot;</strong>
        </Typography>
      )}
      <div className="flex w-full max-w-120 flex-col gap-4 px-4">
        {connected.map((participant) => (
          <div
            className="flex items-center gap-5"
            key={participant.id}
            data-test={`online-readiness-${participant.playerNumber}`}
            data-confirmed={participant.ready}>
            {!everyoneReady && (
              <span className="h-12 w-12 text-2xl [&_svg]:h-12! [&_svg]:w-12! [&_svg]:stroke-black">
                {participant.ready ? (
                  <Icon icon="ic:outline-check-circle" size={12} className="stroke-black" />
                ) : (
                  <Loader />
                )}
              </span>
            )}
            {/* Nothing but the name here — the tick to the left already says who's waited for */}
            <ParticipantSlot className="flex-1" participant={participant} selfId={selfId} showPing={false} />
          </div>
        ))}
      </div>

      {!everyoneReady && (
        <div className="flex w-full max-w-120 flex-col gap-3 px-4">
          <MenuButton onClick={confirm} disabled={self?.ready} data-test="online-ready-button">
            {self?.ready ? "You're ready — waiting for the others" : "I'm ready!"}
          </MenuButton>
          {isHost && hostId === selfId && (
            <MenuButton
              size="small"
              onClick={() => void OnlineClient.rpc.room.cancelStart().catch(console.warn)}
              data-test="online-cancel-start-button">
              Back to the lobby
            </MenuButton>
          )}
          {remainingS !== null && (
            <Menu.HelpText className="text-center text-lg">
              The song starts anyway in <strong data-test="online-readiness-countdown">{remainingS}</strong>
            </Menu.HelpText>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ReadinessOverlay;
