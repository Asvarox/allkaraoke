import { twc } from 'react-twc';
import { ValuesType } from 'utility-types';

import { Badge } from '~/modules/elements/akui/badge';
import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import { MicIconBlue, MicIconRed } from '~/modules/elements/mic-icon';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  onPreferenceSelected: (preference: ValuesType<typeof MicSetupPreference> | 'multiple-mics') => void;
  previouslySelected: string | null;
  skipText?: string;
  onBack?: () => void;
}

function SelectPreference({ onPreferenceSelected, previouslySelected, onBack, skipText }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  const { register } = useKeyboardNav({ onBackspace: onBack, title: 'How do you want to sing?' });

  const remoteMicsLabel = mobilePhoneMode ? 'Connect other phones' : 'Use Smartphones';
  const builtInLabel = `This ${mobilePhoneMode ? "device's" : "computer's"} microphone`;

  return (
    <>
      <InputOptionButton
        {...register(
          'remote-mics',
          () => onPreferenceSelected('remoteMics'),
          undefined,
          previouslySelected === 'remoteMics',
          { control: { type: 'button', label: remoteMicsLabel } },
        )}
        icon={
          <>
            <Icon icon="ic:baseline-phone-android" size={5} />
            <Icon icon="ic:baseline-phone-iphone" size={5} />
          </>
        }
        name={remoteMicsLabel}
        description={
          <>
            Use{' '}
            <strong>
              <Icon icon="ic:baseline-photo-camera" size={4} />
              Camera app
            </strong>{' '}
            to scan a{' '}
            <strong>
              <Icon icon="ic:baseline-qr-code" size={4} />
            </strong>{' '}
            <strong>QR code</strong> that will open Remote Mic website - no need to download an app!
          </>
        }
        recommended
        numOfPlayers="1-4"
      />
      <InputOptionButton
        {...register('built-in', () => onPreferenceSelected('built-in'), undefined, previouslySelected === 'built-in', {
          control: { type: 'button', label: builtInLabel },
        })}
        icon={
          <>
            <Icon icon="ic:baseline-person" size={5} />
            {mobilePhoneMode ? (
              <Icon icon="ic:baseline-phone-iphone" size={5} />
            ) : (
              <Icon icon="ic:baseline-laptop" size={5} />
            )}
          </>
        }
        name={builtInLabel}
        description={
          <>
            Great to <strong>test</strong> the app, <strong>sing alone</strong> or don&#39;t care about the rivalry at
            the party
          </>
        }
        numOfPlayers="1"
      />
      <hr />
      {!mobilePhoneMode && (
        <InputOptionButton
          {...register(
            'multiple-mics',
            () => onPreferenceSelected('multiple-mics'),
            undefined,
            previouslySelected === 'multiple-mics',
            { control: { type: 'button', label: 'Multiple microphones' } },
          )}
          icon={
            <>
              <MicIconBlue />
              <MicIconRed />
            </>
          }
          name="Multiple microphones"
          description={
            <>
              Use either <strong>SingStar</strong> or <strong>multiple microphones</strong> connected to the device for
              each player
            </>
          }
          numOfPlayers="2"
        />
      )}

      <InputOptionButton
        {...register('advanced', () => onPreferenceSelected('advanced'), undefined, previouslySelected === 'advanced', {
          control: { type: 'button', label: 'Advanced (manual) setup' },
        })}
        icon={
          <>
            <MicIconBlue />
            <Icon icon="ic:baseline-phone-iphone" size={5} />
          </>
        }
        name="Advanced (manual) setup"
        description={
          <>
            {' '}
            Assign the specific device to a player manually, e.g. if you don&#39;t have regular SingStar microphones.
          </>
        }
        numOfPlayers="1-4"
      />
      <hr />
      <MenuButton
        {...register('skip', () => onPreferenceSelected('skip'), undefined, previouslySelected === 'skip', {
          control: { type: 'button', label: skipText || 'Skip' },
        })}>
        {skipText || 'Skip'}
      </MenuButton>
    </>
  );
}

const InputOptionButton = ({
  icon,
  name,
  description,
  numOfPlayers,
  recommended,
  ...props
}: {
  icon: React.ReactNode;
  name: React.ReactNode;
  description: React.ReactNode;
  numOfPlayers: string;
  recommended?: boolean;
}) => {
  return (
    <Menu.Button
      {...props}
      className="group relative justify-stretch hover:h-30 data-[focused=true]:h-30"
      subtleFocused>
      <OptionIconContainer className="flex w-20 items-center pl-4">{icon}</OptionIconContainer>
      <div className="flex w-full flex-col group-data-[focused=true]:gap-1">
        {name}
        <span className="description mobile:text-xs max-h-0 overflow-clip text-sm transition-all duration-300 group-hover:max-h-10 group-data-[focused=true]:max-h-10">
          {description}
        </span>
      </div>
      {recommended && <Badge className="right-8">Recommended</Badge>}
      <div className="text-md mobile:text-sm flex w-24 flex-grow items-center justify-end gap-1 self-end pb-1 text-right">
        <Icon icon="ic:baseline-people-alt" className="!text-md !mobile:text-sm" />
        <strong>{numOfPlayers}</strong>
      </div>
    </Menu.Button>
  );
};

// `first-child` (not `first-of-type`) so the overlay styling below always lands on whichever icon
// renders first, regardless of whether the pair is two `<iconify-icon>`s, two `<svg>`s (MicIconBlue/
// MicIconRed), or a mix of both (MicIconBlue + an `<iconify-icon>`) — `first-of-type` would match
// both elements independently once they're different tags.
const OptionIconContainer = twc.div`relative [&_iconify-icon]:text-[#ff3636] [&_iconify-icon]:transition-[300ms] [&_svg]:h-[1em] [&_svg]:w-[1em] [&_svg]:text-[#ff3636] [&_svg]:transition-[300ms] [&>*:first-child]:absolute [&>*:first-child]:z-100 [&>*:first-child]:mt-[0.2em] [&>*:first-child]:ml-[0.35em] [&>*:first-child]:-scale-x-100 [&>*:first-child]:text-[#0099ff]`;

export default SelectPreference;
