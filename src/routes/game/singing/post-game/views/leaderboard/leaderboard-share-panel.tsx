import { Menu } from '~/modules/elements/akui/menu';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import LeaderboardIdentityFields from '~/routes/game/singing/post-game/views/leaderboard/identity-fields';
import { LeaderboardPostGame } from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

interface Props {
  register: RegisterFunc;
  leaderboard: LeaderboardPostGame;
}

/**
 * Sits under the local high scores once the player has a standing decision, so the prompt does not
 * have to interrupt them every time. Registers into the high-scores navigation — its controls come
 * after the score renames and before the button that moves on, matching where they are on screen.
 */
function LeaderboardSharePanel({ register, leaderboard }: Props) {
  const { panel, name, setName, country, setCountry, isSubmitting, stopSharing, openModal } = leaderboard;

  if (panel === null) return null;

  if (panel === 'opt-in') {
    return (
      <div className="mt-2 flex flex-col gap-2" data-test="leaderboard-opt-in-panel">
        <Menu.HelpText>This score is good enough for the global leaderboard on the main menu.</Menu.HelpText>
        <Menu.Button
          size="small"
          className="sm:w-auto sm:min-w-60 sm:self-start"
          data-test="leaderboard-open-prompt"
          {...register('leaderboard-open-prompt', openModal, undefined, false, {
            control: { type: 'button', label: 'Share this score' },
          })}>
          Share this score
        </Menu.Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2" data-test="leaderboard-share-panel">
      <Menu.HelpText>This score goes on the global leaderboard as:</Menu.HelpText>

      <LeaderboardIdentityFields
        register={register}
        name={name}
        onNameChange={setName}
        country={country}
        onCountryChange={setCountry}
        disabled={isSubmitting}
      />

      <Menu.Button
        size="small"
        className="sm:w-auto sm:min-w-60 sm:self-start"
        data-test="leaderboard-stop-sharing"
        {...register('leaderboard-stop-sharing', stopSharing, undefined, false, {
          disabled: isSubmitting,
          control: { type: 'button', label: 'Stop sharing scores', variant: 'back' },
        })}>
        Stop sharing scores
      </Menu.Button>
    </div>
  );
}

export default LeaderboardSharePanel;
