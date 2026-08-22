import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';
import LeaderboardIdentityFields from '~/routes/game/singing/post-game/views/leaderboard/identity-fields';
import { LeaderboardPostGame } from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

interface Props {
  leaderboard: LeaderboardPostGame;
}

/**
 * Asked once, the first time a score is good enough for the global board.
 *
 * Both answers are standing decisions, so there is no per-song question to come back to: accepting
 * hands the player over to the panel on the high-scores step, which is what every later song shows
 * them, and declining swaps that panel for a one-line way back in. Neither is a dead end, which is
 * what lets the prompt stay this short.
 *
 * Online games never reach here — the high-scores step is not rendered for them.
 */
function LeaderboardPrompt({ leaderboard }: Props) {
  const { isModalOpen, score, name, setName, country, setCountry, canSubmit, acceptFromModal, declineFromModal } =
    leaderboard;

  // Exclusive, so the high-scores list underneath keeps its own registration order untouched —
  // in particular the `Select song` button stays last there.
  const { register } = useKeyboardNav({
    enabled: isModalOpen,
    exclusive: true,
    onBackspace: declineFromModal,
    title: 'Global leaderboard',
  });

  return (
    <Modal open={isModalOpen} onClose={declineFromModal} withPortal level="nested">
      <Menu spacing="tight" modal data-test="leaderboard-prompt">
        <Menu.Header>Global leaderboard</Menu.Header>
        <Menu.HelpText>
          <strong className="text-active">
            <ScoreText score={score} />
          </strong>{' '}
          points is good enough for the global leaderboard. Want your scores on the board on the main menu?
        </Menu.HelpText>

        <LeaderboardIdentityFields
          register={register}
          name={name}
          onNameChange={setName}
          country={country}
          onCountryChange={setCountry}
          nameIsDefault
        />

        <Menu.ButtonGroup className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Menu.Button
            size="small"
            className="sm:w-auto sm:min-w-40"
            data-test="leaderboard-decline"
            {...register('leaderboard-decline', declineFromModal, undefined, false, {
              control: { type: 'button', label: 'No thanks', variant: 'back' },
            })}>
            No thanks
          </Menu.Button>
          <Menu.Button
            size="small"
            className="sm:w-auto sm:min-w-40"
            data-test="leaderboard-submit"
            {...register('leaderboard-submit', acceptFromModal, undefined, false, {
              disabled: !canSubmit,
              control: { type: 'button', label: 'Share my scores' },
            })}>
            Share my scores
          </Menu.Button>
        </Menu.ButtonGroup>
      </Menu>
    </Modal>
  );
}

export default LeaderboardPrompt;
