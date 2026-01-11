import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { MicSetupPreference } from '~/routes/Settings/SettingsState';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function Skip(props: Props) {
  useEffect(() => {
    props.onSave();
  }, []);

  return null;
}

export default Skip;
