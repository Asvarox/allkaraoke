import posthog from 'posthog-js';
import { ComponentRef, useMemo, useRef, useState } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { SingSetup, Song } from '~/interfaces';
import { Menu } from '~/modules/elements/akui/menu';
import { Select, SelectOption } from '~/modules/elements/akui/select';
import { Flag } from '~/modules/elements/flag';
import { Input } from '~/modules/elements/input';
import Modal from '~/modules/elements/modal';
import GameState from '~/modules/game-engine/game-state/game-state';
import InputManager from '~/modules/game-engine/input/input-manager';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { submitScore } from '~/modules/leaderboard/client';
import { getCountries, NO_COUNTRY } from '~/modules/leaderboard/countries';
import { getPrefilledCountry, getPrefilledName, persistIdentity } from '~/modules/leaderboard/identity';
import { encodeNotesPayload } from '~/modules/leaderboard/notes-payload';
import { qualifiesForLeaderboard } from '~/modules/leaderboard/qualifies';
import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import PlayersManager from '~/modules/players/players-manager';

interface Props {
  song: Song;
  singSetup: SingSetup;
}

type RegisterProps = ReturnType<RegisterFunc>;

/** `Select` consumes the arrow-out handler; a plain `Input` would pass it straight to the DOM. */
const withoutNavHandler = (props: RegisterProps) => {
  const { $keyboardNavigationChangeFocus: _navHandler, ...rest } = props as RegisterProps &
    Record<'$keyboardNavigationChangeFocus', unknown>;

  return rest;
};

// Sized by whichever container `Select` puts it in — the option list, or the strip on the field
const flagIcon = (isocode: string) => <Flag isocode={isocode} loading="lazy" className="h-full w-full object-cover" />;

/**
 * Asks the highest-scoring local player whether their score should go on the global board.
 *
 * v1 has no "never ask again": a player who always declines sees this after every qualifying song.
 * That was an explicit trade in the design doc, in exchange for storing nothing on a "no".
 *
 * Online games never reach here — the high-scores step is not rendered for them.
 */
function LeaderboardPrompt({ song, singSetup }: Props) {
  const leaderboardEnabled = useLeaderboardEnabled();

  const topPlayer = useMemo(() => {
    const players = PlayersManager.getPlayers().map((player) => ({
      number: player.number,
      name: player.getName(),
      score: GameState.getPlayerScore(player.number),
    }));

    return players.sort((first, second) => second.score - first.score)[0] ?? null;
  }, []);

  const qualifies = !!topPlayer && qualifiesForLeaderboard(topPlayer.score);
  const isOpenInitially = !!leaderboardEnabled && qualifies;

  const nameRef = useRef<ComponentRef<typeof Input>>(null);
  const countryRef = useRef<ComponentRef<typeof Select>>(null);

  const [isOpen, setIsOpen] = useState(isOpenInitially);
  const [name, setName] = useState(() => getPrefilledName(topPlayer?.name));
  const [country, setCountry] = useState(getPrefilledCountry);

  const countryOptions = useMemo<SelectOption[]>(
    () => [
      { value: NO_COUNTRY, label: 'Prefer not to say', icon: flagIcon('un') },
      ...getCountries().map(({ code, name: countryName }) => ({
        value: code,
        label: countryName,
        icon: flagIcon(code),
      })),
    ],
    [],
  );

  const dismiss = () => {
    setIsOpen(false);
    posthog.capture('leaderboardDismissed', { songId: song.id, score: topPlayer?.score ?? null });
  };

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !topPlayer) return;

    // Both "nothing picked" and the explicit "Prefer not to say" store no country
    const submittedCountry = country && country !== NO_COUNTRY ? country : null;

    setIsOpen(false);
    persistIdentity(trimmedName, submittedCountry);

    const playerState = GameState.getPlayer(topPlayer.number);

    // Fire-and-forget: `submitScore` swallows its own failures
    void submitScore({
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

    // Never the name or the country — this event is analytics, the board is the only place identity goes
    posthog.capture('leaderboardSubmitted', { songId: song.id, score: topPlayer.score });
  };

  // Exclusive, so the high-scores list underneath keeps its own registration order untouched —
  // in particular the `Select song` button stays last there.
  const { register } = useKeyboardNav({
    enabled: isOpen,
    exclusive: true,
    onBackspace: dismiss,
    title: 'Global leaderboard',
  });

  if (!isOpenInitially) return null;

  return (
    <Modal open={isOpen} onClose={dismiss} withPortal level="nested">
      <Menu spacing="tight" modal data-test="leaderboard-prompt">
        <Menu.Header>Global leaderboard</Menu.Header>
        <Menu.HelpText>
          That score is good enough for the global leaderboard. Want it on the board on the main menu?
        </Menu.HelpText>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            className="ph-no-capture flex-1"
            label="Name"
            value={name}
            onChange={setName}
            maxLength={MAX_NAME_LENGTH}
            ref={nameRef}
            // `Input` forwards unknown props to the DOM, and the nav handler is not a valid attribute
            {...withoutNavHandler(
              register('leaderboard-name', () => nameRef.current?.element?.focus(), undefined, true, {
                control: { type: 'text', label: 'Name', value: name },
                onValueChange: setName,
              }),
            )}
          />
          <Select
            className="ph-no-capture flex-1"
            // No label: the placeholder carries the field's meaning, and the flag fills the rest
            label=""
            placeholder="Select Country"
            value={country}
            onChange={setCountry}
            options={countryOptions}
            ref={countryRef}
            // Focusing the field is what opens the list, so the keyboard has to focus it too
            {...register('leaderboard-country', () => countryRef.current?.element?.focus(), undefined, false, {
              control: { type: 'text', label: 'Country', value: country },
              onValueChange: setCountry,
            })}
          />
        </div>

        <Menu.ButtonGroup className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Menu.Button
            size="small"
            className="sm:w-auto sm:min-w-40"
            data-test="leaderboard-decline"
            {...register('leaderboard-decline', dismiss, undefined, false, {
              control: { type: 'button', label: 'No thanks', variant: 'back' },
            })}>
            No thanks
          </Menu.Button>
          <Menu.Button
            size="small"
            className="sm:w-auto sm:min-w-40"
            data-test="leaderboard-submit"
            {...register('leaderboard-submit', submit, undefined, false, {
              disabled: !name.trim(),
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
