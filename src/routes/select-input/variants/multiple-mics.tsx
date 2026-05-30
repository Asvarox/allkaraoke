import { ValuesType } from 'utility-types';
import { MenuButton } from '~/modules/elements/menu';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { MicSetupPreference } from '~/routes/settings/settings-state';

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
