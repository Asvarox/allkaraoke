import styled from '@emotion/styled';
import { Laptop, PeopleAlt, Person, PhoneAndroid, PhoneIphone, PhotoCamera, QrCode } from '@mui/icons-material';
import { ValuesType } from 'utility-types';
import { Badge } from '~/modules/Elements/Badge';
import { MenuButton } from '~/modules/Elements/Menu';
import { MicIconBlue, MicIconRed } from '~/modules/Elements/MicIcon';
import { focused, typography } from '~/modules/Elements/cssMixins';
import styles from '~/modules/GameEngine/Drawing/styles';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from '~/routes/Settings/SettingsState';

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
      <Option
        {...register(
          'remote-mics',
          () => onPreferenceSelected('remoteMics'),
          undefined,
          previouslySelected === 'remoteMics',
        )}>
        <OptionIconContainer>
          <PhoneAndroid />
          <PhoneIphone />
        </OptionIconContainer>
        <div>
          {mobilePhoneMode ? 'Connect other phones' : 'Use Smartphones'}
          <OptionDescription>
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
          </OptionDescription>
        </div>
        <Badge>Recommended</Badge>
        <PlayersNumber>
          <PeopleAlt />
          <strong>1-4</strong>
        </PlayersNumber>
      </Option>
      <Option
        {...register('built-in', () => onPreferenceSelected('built-in'), undefined, previouslySelected === 'built-in')}>
        <OptionIconContainer>
          <Person />
          {mobilePhoneMode ? <PhoneIphone /> : <Laptop />}
        </OptionIconContainer>
        <div>
          This {mobilePhoneMode ? "device's" : "computer's"} microphone
          <OptionDescription>
            Great to <strong>test</strong> the app, <strong>sing alone</strong> or don&#39;t care about the rivalry at
            the party
          </OptionDescription>
        </div>
        <PlayersNumber>
          <Person />
          <strong>1</strong>
        </PlayersNumber>
      </Option>
      <hr />
      {!mobilePhoneMode && (
        <Option
          {...register(
            'multiple-mics',
            () => onPreferenceSelected('multiple-mics'),
            undefined,
            previouslySelected === 'multiple-mics',
          )}>
          <OptionIconContainer>
            <MicIconBlue />
            <MicIconRed />
          </OptionIconContainer>
          <div>
            Multiple microphones
            <OptionDescription>
              Use either <strong>SingStar</strong> or <strong>multiple microphones</strong> connected to the device for
              each player
            </OptionDescription>
          </div>
          <PlayersNumber>
            <PeopleAlt />
            <strong>2</strong>
          </PlayersNumber>
        </Option>
      )}
      <Option
        {...register('advanced', () => onPreferenceSelected('advanced'), undefined, previouslySelected === 'advanced')}>
        <OptionIconContainer>
          <MicIconBlue />
          <PhoneIphone />
        </OptionIconContainer>
        <div>
          Advanced (manual) setup
          <OptionDescription>
            Assign the specific device to a player manually, e.g. if you don&#39;t have regular SingStar microphones.
          </OptionDescription>
        </div>
        <PlayersNumber>
          <PeopleAlt />
          <strong>1-4</strong>
        </PlayersNumber>
      </Option>
      <hr />
      <MenuButton {...register('skip', () => onPreferenceSelected('skip'), undefined, previouslySelected === 'skip')}>
        {skipText || 'Skip'}
      </MenuButton>
    </>
  );
}

const PlayersNumber = styled.div`
  ${typography};
  //width: 15rem;
  position: absolute;
  inset: auto 0.5rem 0.5rem auto;
  svg {
    font-size: 0.9em;
  }

  gap: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const OptionDescription = styled.div<{ focused?: boolean }>`
  padding: 0 3rem 0 6rem;
  font-size: 1.6rem;
  max-height: 0;
  overflow: clip;
  transition: 300ms;

  svg {
    font-size: 1.4rem;
  }
  opacity: 0;
`;

const OptionIconContainer = styled.div`
  position: relative;
  margin: 0rem 0.6rem 0 2.5rem;
  transition: 300ms;

  svg {
    transition: 300ms;
    width: 3.6rem;
    height: 3.6rem;
    color: ${styles.colors.players[1].text};
  }

  svg:first-of-type {
    top: 0.6rem;
    left: 1.25rem;
    position: absolute;
    color: ${styles.colors.players[0].text};
    z-index: 100;
    transform: scaleX(-1);
  }
`;

const Option = styled(MenuButton)<{ focused?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  &:hover,
  &[data-focused='true'] {
    height: 16.5rem;
    background: black;
    ${focused};

    ${OptionDescription} {
      padding-top: 1.6rem;
      max-height: 10rem;
      opacity: 1;
      opacity: 1;
    }

    ${OptionIconContainer} {
      transform: scale(1.75);
    }
  }
`;

export default SelectPreference;
