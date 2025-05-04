import { createContext } from 'react';
import { HelpEntry } from 'routes/KeyboardHelp/Context';

export const KeyboardHelpContext = createContext({
  setKeyboard: (_name: string, _helpEntry: HelpEntry): void => {},
  unsetKeyboard: (_name: string): void => {},
  hasContent: false,
});
