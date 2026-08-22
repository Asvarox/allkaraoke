import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import LeaderboardIdentityFields from '~/routes/game/singing/post-game/views/leaderboard/identity-fields';
import { LeaderboardPostGame } from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

interface Props {
  register: RegisterFunc;
  leaderboard: LeaderboardPostGame;
}

/**
 * `Box` centres its children; the panel stacks them full width instead. Its own `bg-black/30` is
 * invisible against this screen, so the surface is spelled out — `bg-black/50` matches the score
 * rows above, and the border is what actually reads as an edge.
 */
const panelClassName = 'mt-2 w-full items-stretch justify-start gap-2 border border-white/10 bg-black/50 p-3';

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
      <Box className={panelClassName} data-test="leaderboard-opt-in-panel">
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
      </Box>
    );
  }

  return (
    <Box className={panelClassName} data-test="leaderboard-share-panel">
      <Menu.HelpText>This score goes on the global leaderboard as:</Menu.HelpText>

      <LeaderboardIdentityFields
        register={register}
        name={name}
        onNameChange={setName}
        country={country}
        onCountryChange={setCountry}
        disabled={isSubmitting}
        trailing={
          <Menu.Button
            size="small"
            className="shrink-0 sm:w-auto"
            data-test="leaderboard-stop-sharing"
            {...register('leaderboard-stop-sharing', stopSharing, undefined, false, {
              disabled: isSubmitting,
              control: { type: 'button', label: 'Stop sharing scores', variant: 'back' },
            })}>
            Stop sharing
          </Menu.Button>
        }
      />
    </Box>
  );
}

export default LeaderboardSharePanel;
