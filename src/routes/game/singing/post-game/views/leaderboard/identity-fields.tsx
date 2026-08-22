import { ComponentRef, ReactNode, useMemo, useRef } from 'react';

import { MAX_NAME_LENGTH } from '~/consts';
import { Select, SelectOption } from '~/modules/elements/akui/select';
import { Flag } from '~/modules/elements/flag';
import { Input } from '~/modules/elements/input';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { getCountries, NO_COUNTRY } from '~/modules/leaderboard/countries';

type RegisterProps = ReturnType<RegisterFunc>;

/** `Select` consumes the arrow-out handler; a plain `Input` would pass it straight to the DOM. */
const withoutNavHandler = (props: RegisterProps) => {
  const { $keyboardNavigationChangeFocus: _navHandler, ...rest } = props as RegisterProps &
    Record<'$keyboardNavigationChangeFocus', unknown>;

  return rest;
};

// Sized by whichever container `Select` puts it in — the option list, or the strip on the field
const flagIcon = (isocode: string) => <Flag isocode={isocode} loading="lazy" className="h-full w-full object-cover" />;

interface Props {
  register: RegisterFunc;
  name: string;
  onNameChange: (name: string) => void;
  country: string;
  onCountryChange: (country: string) => void;
  /** Whether the name field is where the keyboard starts. False inside the high-scores list, whose
   * own default is the button that moves on to the next song. */
  nameIsDefault?: boolean;
  disabled?: boolean;
  /** Rendered as a third item of the field row, so it lines up with the fields rather than under them. */
  trailing?: ReactNode;
}

/**
 * The board identity a score is submitted under. Rendered both by the prompt and by the panel on
 * the high-scores step, so editing it in either place means the same thing.
 */
function LeaderboardIdentityFields({
  register,
  name,
  onNameChange,
  country,
  onCountryChange,
  nameIsDefault = false,
  disabled = false,
  trailing,
}: Props) {
  const nameRef = useRef<ComponentRef<typeof Input>>(null);
  const countryRef = useRef<ComponentRef<typeof Select>>(null);

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

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select
        className="ph-no-capture min-w-0 sm:basis-1/3"
        // No label: the placeholder carries the field's meaning, and the flag fills the rest. The
        // placeholder disappears once a country is picked, so the accessible name is spelled out.
        label=""
        aria-label="Country"
        placeholder="Select Country"
        value={country}
        onChange={onCountryChange}
        options={countryOptions}
        ref={countryRef}
        disabled={disabled}
        // Focusing the field is what opens the list, so the keyboard has to focus it too
        {...register('leaderboard-country', () => countryRef.current?.element?.focus(), undefined, false, {
          disabled,
          control: { type: 'text', label: 'Country', value: country },
          onValueChange: onCountryChange,
        })}
      />
      <Input
        className="ph-no-capture min-w-0 sm:basis-2/3"
        label="Name"
        value={name}
        onChange={onNameChange}
        maxLength={MAX_NAME_LENGTH}
        ref={nameRef}
        disabled={disabled}
        // `Input` forwards unknown props to the DOM, and the nav handler is not a valid attribute
        {...withoutNavHandler(
          register('leaderboard-name', () => nameRef.current?.element?.focus(), undefined, nameIsDefault, {
            disabled,
            control: { type: 'text', label: 'Name', value: name },
            onValueChange: onNameChange,
          }),
        )}
      />
      {trailing}
    </div>
  );
}

export default LeaderboardIdentityFields;
