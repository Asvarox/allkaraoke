import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { MicSetupPreference } from '~/routes/settings/settings-state';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save once on mount
  }, []);

  return null;
}

export default Skip;
