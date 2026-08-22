import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import { NavCheckbox } from '~/modules/elements/nav-controls';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';
import LeaderboardIdentityFields from '~/routes/game/singing/post-game/views/leaderboard/identity-fields';
import { LeaderboardPostGame } from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

interface Props {
  leaderboard: LeaderboardPostGame;
}

/**
 * Asks the highest-scoring local player whether their score should go on the global board.
 *
 * The two standing decisions live here: ticking the checkbox shares every future qualifying score
 * without asking, and "Don't ask again" closes the prompt for good — the high-scores step keeps a
 * way back in either way, so neither is a dead end.
 *
 * Online games never reach here — the high-scores step is not rendered for them.
 */
function LeaderboardPrompt({ leaderboard }: Props) {
  const {
    isModalOpen,
    score,
    name,
    setName,
    country,
    setCountry,
    alwaysShare,
    setAlwaysShare,
    canSubmit,
    submitFromModal,
    dismissOnce,
    neverAskAgain,
  } = leaderboard;

  // Exclusive, so the high-scores list underneath keeps its own registration order untouched —
  // in particular the `Select song` button stays last there.
  const { register } = useKeyboardNav({
    enabled: isModalOpen,
    exclusive: true,
    onBackspace: dismissOnce,
    title: 'Global leaderboard',
  });

  return (
    <Modal open={isModalOpen} onClose={dismissOnce} withPortal level="nested">
      <Menu spacing="tight" modal data-test="leaderboard-prompt">
        <Menu.Header>Global leaderboard</Menu.Header>
        <Menu.HelpText>
          <strong className="text-active">
            <ScoreText score={score} />
          </strong>{' '}
          points is good enough for the global leaderboard. Want it on the board on the main menu?
        </Menu.HelpText>

        <LeaderboardIdentityFields
          register={register}
          name={name}
          onNameChange={setName}
          country={country}
          onCountryChange={setCountry}
          nameIsDefault
        />

        <NavCheckbox
          nav={register}
          name="leaderboard-always-share"
          label="Share my scores from now on"
          checked={alwaysShare}
          onClick={() => setAlwaysShare(!alwaysShare)}
        />

        <Menu.ButtonGroup className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Menu.Button
            size="small"
            className="sm:w-auto"
            data-test="leaderboard-never"
            {...register('leaderboard-never', neverAskAgain, undefined, false, {
              control: { type: 'button', label: "Don't ask again", variant: 'back' },
            })}>
            Don&apos;t ask again
          </Menu.Button>
          <Menu.Button
            size="small"
            className="sm:w-auto sm:min-w-40"
            data-test="leaderboard-decline"
            {...register('leaderboard-decline', dismissOnce, undefined, false, {
              control: { type: 'button', label: 'No thanks', variant: 'back' },
            })}>
            No thanks
          </Menu.Button>
          <Menu.Button
            size="small"
            className="sm:w-auto sm:min-w-40"
            data-test="leaderboard-submit"
            {...register('leaderboard-submit', submitFromModal, undefined, false, {
              disabled: !canSubmit,
              control: { type: 'button', label: 'Submit' },
            })}>
            Submit
          </Menu.Button>
        </Menu.ButtonGroup>
      </Menu>
    </Modal>
  );
}

export default LeaderboardPrompt;
