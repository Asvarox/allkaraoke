import { useEffect } from 'react';
import { MicSetupPreference } from 'routes/Settings/SettingsState';
import { ValuesType } from 'utility-types';

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
