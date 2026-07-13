import { useContext, useEffect, useRef } from 'react';
import { HelpEntry } from '~/routes/keyboard-help/context';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';

let id = 0;

export default function useKeyboardHelp(help: HelpEntry, enabled: boolean) {
  const name = useRef(`${String(Math.random())}-${id++}`);
  const { setKeyboard, updateKeyboard, unsetKeyboard } = useContext(KeyboardHelpContext);

  const setHelp = (help: HelpEntry) => {
    setKeyboard(name.current, help);
  };

  const clearHelp = () => unsetKeyboard(name.current);

  const helpRef = useRef(help);
  helpRef.current = help;

  // Registers/unregisters presence - only reacts to `enabled` (plus mount/unmount), so becoming
  // active isn't affected by `help` content refreshing while this stays enabled the whole time.
  useEffect(() => {
    const currentName = name.current;
    if (enabled) {
      setKeyboard(currentName, helpRef.current);
      return () => unsetKeyboard(currentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- registration lifecycle is intentionally keyed on `enabled` only
  }, [enabled]);

  // Keeps the registered help text/remote actions fresh without touching which entry is "active".
  useEffect(() => {
    if (enabled) {
      updateKeyboard(name.current, help);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- content refresh is intentionally keyed on `help` only
  }, [help]);

  return { setHelp, clearHelp };
}
