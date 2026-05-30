import { useContext, useEffect, useRef } from 'react';
import { HelpEntry } from '~/routes/keyboard-help/context';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';

let id = 0;

export default function useKeyboardHelp(help: HelpEntry, enabled: boolean) {
  const name = useRef(`${String(Math.random())}-${id++}`);
  const { setKeyboard, unsetKeyboard } = useContext(KeyboardHelpContext);

  const setHelp = (help: HelpEntry) => {
    setKeyboard(name.current, help);
  };

  const clearHelp = () => unsetKeyboard(name.current);

  useEffect(() => {
    if (enabled) {
      setHelp(help);
    }

    return clearHelp;
  }, [help, enabled]);

  return { setHelp, clearHelp };
}
