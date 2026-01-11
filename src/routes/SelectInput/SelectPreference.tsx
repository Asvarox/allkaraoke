import { Laptop, PeopleAlt, Person, PhoneAndroid, PhoneIphone, PhotoCamera, QrCode } from '@mui/icons-material';
import { Menu } from 'modules/Elements/AKUI/Menu';
import { Badge } from 'modules/Elements/Badge';
import { MenuButton } from 'modules/Elements/Menu';
import { MicIconBlue, MicIconRed } from 'modules/Elements/MicIcon';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import { twc } from 'react-twc';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';
import { ValuesType } from 'utility-types';

interface Props {
  onPreferenceSelected: (preference: ValuesType<typeof MicSetupPreference> | 'multiple-mics') => void;
  previouslySelected: string | null;
  skipText?: string;
  onBack?: () => void;
}

function SelectPreference({ onPreferenceSelected, previouslySelected, onBack, skipText }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  const { register } = useKeyboardNav({ onBackspace: onBack });
  return (
    <>
      <InputOptionButton
        {...register(
          'remote-mics',
          () => onPreferenceSelected('remoteMics'),
          undefined,
          previouslySelected === 'remoteMics',
        )}
        icon={
          <>
            <PhoneAndroid />
            <PhoneIphone />
          </>
        }
        name={mobilePhoneMode ? 'Connect other phones' : 'Use Smartphones'}
        description={
          <>
            Use{' '}
            <strong>
              <PhotoCamera />
              Camera app
            </strong>{' '}
            to scan a{' '}
            <strong>
              <QrCode /> QR code
            </strong>{' '}
            that will open Remote Mic website - no need to download an app!
          </>
        }
        recommended
        numOfPlayers="1-4"
      />
      <InputOptionButton
        {...register('built-in', () => onPreferenceSelected('built-in'), undefined, previouslySelected === 'built-in')}
        icon={
          <>
            <Person />
            {mobilePhoneMode ? <PhoneIphone /> : <Laptop />}
          </>
        }
        name={`This ${mobilePhoneMode ? "device's" : "computer's"} microphone`}
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
        {...register('advanced', () => onPreferenceSelected('advanced'), undefined, previouslySelected === 'advanced')}
        icon={
          <>
            <MicIconBlue />
            <PhoneIphone />
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
      <MenuButton {...register('skip', () => onPreferenceSelected('skip'), undefined, previouslySelected === 'skip')}>
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
        <PeopleAlt className="!text-md !mobile:text-sm" />
        <strong>{numOfPlayers}</strong>
      </div>
    </Menu.Button>
  );
};

const OptionIconContainer = twc.div`relative [&_svg]:h-[1em] [&_svg]:w-[1em] [&_svg]:text-[#ff3636] [&_svg]:transition-[300ms] [&_svg:first-of-type]:absolute [&_svg:first-of-type]:z-100 [&_svg:first-of-type]:mt-[0.2em] [&_svg:first-of-type]:ml-[0.35em] [&_svg:first-of-type]:-scale-x-100 [&_svg:first-of-type]:text-[#0099ff]`;

export default SelectPreference;
