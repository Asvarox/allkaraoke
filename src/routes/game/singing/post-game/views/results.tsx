import clsx from 'clsx';
import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { GAME_MODE, SingSetup } from '~/interfaces';
import CameraManager from '~/modules/camera/camera-manager';
import { Button } from '~/modules/elements/akui/button';
import { sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { PlayerScore } from '~/routes/game/singing/post-game/post-game-view';
import CameraRoll from '~/routes/game/singing/post-game/views/results/camera-roll';
import { CameraRollPlaceholder } from '~/routes/game/singing/post-game/views/results/camera-roll-placeholder';
import PlayerScoreView from '~/routes/game/singing/post-game/views/results/player-score';
import ScoreChart from '~/routes/game/singing/post-game/views/results/score-chart';
import {
  REVEAL_DURATION,
  WINNER_REVEAL_DELAY,
  easeOutReveal,
  getRevealedScore,
} from '~/routes/game/singing/post-game/views/results/score-utils';

interface Props {
  onNextStep: () => void;
  players: PlayerScore[];
  singSetup: SingSetup;
  /** Online mode hides the camera roll — the singers are not in the same room. */
  cameraEnabled?: boolean;
}

function ResultsView({ onNextStep, players, singSetup, cameraEnabled = true }: Props) {
  /** How far through the song the reveal has played, 0–1. Every number, bar and chart line on this
   * screen is derived from it, which is what keeps them all showing the same moment. */
  const [progress, setProgress] = useState(0);
  const [skipped, setSkipped] = useState(false);
  /** Held back a beat after the numbers land, so the badge and the bigger timelapse read as their
   * own moment rather than arriving under a still-moving score. */
  const [isWinnerRevealed, setIsWinnerRevealed] = useState(false);

  useEffect(() => {
    if (skipped) {
      setProgress(1);
      return;
    }

    // Driven frame by frame rather than by a CSS/spring animation because the value has to be
    // readable in render: the rows re-sort by it and the chart is clipped to it.
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(easeOutReveal(Math.min(1, elapsed / REVEAL_DURATION)));
      if (elapsed < REVEAL_DURATION) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [skipped]);

  const isRevealFinished = progress >= 1;

  useEffect(() => {
    if (!isRevealFinished) return;
    // Skipping means "show me the end", so it does not also sit through the pause.
    if (skipped) {
      setIsWinnerRevealed(true);
      return;
    }

    const timeout = setTimeout(() => setIsWinnerRevealed(true), WINNER_REVEAL_DELAY);

    return () => clearTimeout(timeout);
  }, [isRevealFinished, skipped]);

  const nextStep = () => {
    if (!isWinnerRevealed) {
      setSkipped(true);
    } else {
      onNextStep();
    }
  };

  const { register } = useKeyboardNav({ title: 'Your score' });

  const isCoop = singSetup.mode === GAME_MODE.CO_OP;
  const finalPlayers = isCoop ? [{ ...players[0], name: players.map((player) => player.name).join(', ') }] : players;

  // Sorted by the score reached so far, so the list reorders live as the song plays back — a player
  // who pulled ahead only in the last chorus climbs the board when that chorus is drawn.
  const rankedPlayers = finalPlayers
    .map((player) => ({ player, revealed: getRevealedScore(player, progress) }))
    .map((entry) => ({ ...entry, score: sumDetailedScore(entry.revealed) }))
    .sort((a, b) => b.score - a.score);

  // Online has no camera roll to fill the right-hand column, so once the scores have settled the
  // chart takes the height of the top two rows beside it. Measured rather than guessed: row height
  // moves with the winner's larger text and with the labels under whichever row is on top.
  const rowsRef = useRef<HTMLDivElement>(null);
  const [topRowsHeight, setTopRowsHeight] = useState<number>();
  const matchTopRows = !cameraEnabled && isWinnerRevealed;

  useLayoutEffect(() => {
    const rows = rowsRef.current;
    if (!rows || !matchTopRows) return;

    const measure = () => {
      const [first, second] = Array.from(rows.children) as HTMLElement[];
      if (!first) return;
      // `offsetTop`/`offsetHeight` rather than `getBoundingClientRect`: the rows reorder through
      // Motion's layout animation, which slides them with transforms. A rect would capture a row
      // mid-slide, and since transforms leave the border box alone, no resize would follow to
      // correct it. Bottom of the second row minus the top of the first, so the gap counts too.
      const last = second ?? first;
      setTopRowsHeight(last.offsetTop + last.offsetHeight - first.offsetTop);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rows);
    Array.from(rows.children).forEach((row) => observer.observe(row));

    return () => observer.disconnect();
  }, [matchTopRows, rankedPlayers.length]);

  const initialCameraPermission = useMemo(() => CameraManager.getPermissionStatus(), []);
  // needs to be here to force rerender of Results so Next button is selected after enabling camera
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const enableCamera = () => {
    setIsRequestInProgress(true);
    CameraManager.requestPermissions().then(() => setIsRequestInProgress(false));
  };

  // Shared by the right-hand column and the Next button below it, so the button lines up with the
  // column's edges instead of tracking it by eye. Both sit in the same full-width parent, so the
  // same fraction gives the same pixel width.
  const rightColumnWidth =
    cameraEnabled && initialCameraPermission && isWinnerRevealed ? 'sm:w-2/5 md:w-5/14' : 'sm:w-1/3 md:w-1/3';

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row md:gap-6">
        <div className="flex flex-col gap-2 sm:flex-1" ref={rowsRef}>
          {/* The slide is short because ranks now change as often as the song crosses players over:
              a slower one leaves a row showing its new rank number while still in its old spot. */}
          {rankedPlayers.map(({ player, revealed, score }, index) => (
            <motion.div layout transition={{ duration: 0.25 }} key={player.playerNumber}>
              <PlayerScoreView
                playerNumber={player.playerNumber}
                useColors={!isCoop}
                rank={index + 1}
                score={score}
                revealed={revealed}
                isWinner={isWinnerRevealed && index === 0}
                player={player}
              />
            </motion.div>
          ))}
        </div>
        <div className={clsx('flex flex-col gap-2 transition-[width] duration-300', rightColumnWidth)}>
          {cameraEnabled &&
            (initialCameraPermission ? (
              <CameraRoll />
            ) : (
              <CameraRollPlaceholder register={register} onConfirm={enableCamera} loading={isRequestInProgress} />
            ))}
          <ScoreChart
            players={finalPlayers}
            progress={progress}
            useColors={!isCoop}
            height={matchTopRows ? topRowsHeight : undefined}
          />
        </div>
      </div>
      <NextButton
        register={register}
        isAnimFinished={isWinnerRevealed}
        onClick={nextStep}
        widthClass={rightColumnWidth}
      />
    </>
  );
}

/**
 * Its own component so `register` runs during THIS render rather than the parent's: a register()
 * call inline in the parent's JSX runs before any child renders, which would place this button ahead
 * of the camera-roll placeholder above it — both in arrow navigation and in the control list
 * mirrored to the remote mic, neither of which would then match what's on screen.
 */
function NextButton({
  register,
  isAnimFinished,
  onClick,
  widthClass,
}: {
  register: RegisterFunc;
  isAnimFinished: boolean;
  onClick: () => void;
  /** The right-hand column's width, so the button sits flush under it. The focus `scale` is a
   * transform on top of this, so it does not change the width being matched. */
  widthClass: string;
}) {
  const label = isAnimFinished ? 'Leaderboards' : 'Skip animation';
  return (
    <Button
      {...register('next-button', onClick, undefined, true, { control: { type: 'button', label } })}
      data-test={isAnimFinished ? 'highscores-button' : 'skip-animation-button'}
      size="regular"
      className={clsx('w-full transition-[width] duration-300 sm:ml-auto 2xl:mt-auto', widthClass)}>
      {label}
    </Button>
  );
}

export default ResultsView;
