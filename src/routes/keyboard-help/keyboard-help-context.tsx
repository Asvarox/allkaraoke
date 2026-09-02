import { createContext } from 'react';

import { HelpEntry, RegularHelpEntry } from '~/routes/keyboard-help/context';

export const KeyboardHelpContext = createContext({
  setKeyboard: (_name: string, _helpEntry: HelpEntry): void => {},
  updateKeyboard: (_name: string, _helpEntry: HelpEntry): void => {},
  unsetKeyboard: (_name: string): void => {},
  hasContent: false,
  /**
   * The active screen's key list, already stripped of the remote-mic-only metadata. Exposed so a
   * screen that renders the help itself (`placement: 'inline'`) shows exactly what the corner view
   * would have.
   */
  help: {} as RegularHelpEntry,
});
