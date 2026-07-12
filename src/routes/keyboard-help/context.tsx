import { omit } from 'es-toolkit';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import ConnectionStatus from '~/modules/remote-mic/connection-status';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';
import KeyboardHelpView from './help-view';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'shiftR' | 'alphanumeric';

type remoteActions = 'search' | 'select-song';

export type RegularHelpEntry = Partial<Record<keys, string | null>>;
export type HelpEntry = RegularHelpEntry & { remote?: remoteActions[] };

type KeyboardsList = Record<string, HelpEntry>;

export const KeyboardHelpProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [keyboards, setKeyboards] = useState<KeyboardsList>({});
  // Tracks registration order separately from `keyboards`. The *last newly-registered* entry is
  // considered "active" - relying on Object.entries key order doesn't work since updating an
  // existing key's value doesn't move it to the end. Only `setKeyboard`/`unsetKeyboard` (mounting,
  // unmounting, or an `enabled` transition) touch `order`; `updateKeyboard` refreshes an already-
  // registered entry's content without reshuffling it, so a background component's help text
  // changing (e.g. mic level driven re-renders) can't steal "active" status from whichever screen
  // the user is actually on.
  const [order, setOrder] = useState<string[]>([]);

  const setKeyboard = (name: string, helpEntry: HelpEntry) => {
    setKeyboards((kbs) => ({
      ...kbs,
      [name]: helpEntry,
    }));
    setOrder((current) => (current.includes(name) ? current : [...current, name]));
  };

  const updateKeyboard = (name: string, helpEntry: HelpEntry) => {
    setKeyboards((kbs) => (name in kbs ? { ...kbs, [name]: helpEntry } : kbs));
  };

  const unsetKeyboard = (name: string) => {
    setKeyboards((kbs) => omit(kbs, [name]));
    setOrder((current) => current.filter((entry) => entry !== name));
  };

  const name = order.at(-1);
  const help = name ? keyboards[name] : undefined;

  useEffect(() => {
    RemoteMicServer.publish('keyboard-layout', help);
  }, [name, help]);

  const { remote, ...rest } = help ?? {};

  const hasContent = !!Object.values(rest).length;

  return (
    <KeyboardHelpContext value={{ setKeyboard, updateKeyboard, unsetKeyboard, hasContent }}>
      {children}
      <KeyboardHelpView help={rest} />
      <ConnectionStatus />
    </KeyboardHelpContext>
  );
};
