import { MenuButton } from 'Elements/Menu';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { ValuesType } from 'utility-types';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function MultipleMics(props: Props) {
  const { register } = useKeyboardNav({ onBackspace: props.onBack });
  return (
    <>
      <MenuButton {...register('singstar-mics', () => props.changePreference('singstar-mics'))}>
        SingStar microphones
      </MenuButton>
      <MenuButton {...register('different-mics-button', () => props.changePreference('different-mics'))}>
        Multiple different microphones
      </MenuButton>
      <hr />
      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
    </>
  );
}

export default MultipleMics;
