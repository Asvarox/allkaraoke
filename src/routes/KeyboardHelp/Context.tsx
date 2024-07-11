import { omit } from 'lodash-es';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect } from 'modules/GameEvents/hooks';
import ConnectionStatus from 'modules/RemoteMic/ConnectionStatus';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { createContext, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import KeyboardHelpView from './HelpView';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'shiftR' | 'alphanumeric';

type remoteActions = 'search';

export type RegularHelpEntry = Partial<Record<keys, string | null>>;
export type HelpEntry = RegularHelpEntry & { remote?: remoteActions[] };

export const KeyboardHelpContext = createContext({
  setKeyboard: (name: string, helpEntry: HelpEntry): void => {},
  unsetKeyboard: (name: string): void => {},
  hasContent: false,
});

type KeyboardsList = Record<string, HelpEntry>;

export const KeyboardHelpProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [keyboards, setKeyboards] = useState<KeyboardsList>({});

  const setKeyboard = (name: string, helpEntry: HelpEntry) => {
    setKeyboards((kbs) => ({
      ...kbs,
      [name]: helpEntry,
    }));
  };

  const unsetKeyboard = (name: string) => setKeyboards((kbs) => omit(kbs, [name]));

  const [name, help] = Object.entries(keyboards).at(-1) ?? [];

  useEventEffect(events.remoteMicConnected, ({ id }) => {
    RemoteMicManager.getRemoteMicById(id)?.connection.send({
      t: 'keyboard-layout',
      help,
    });
  });

  useEffect(() => {
    RemoteMicManager.broadcast({
      t: 'keyboard-layout',
      help,
    });
  }, [name]);

  const { remote, ...rest } = help ?? {};

  const hasContent = !!Object.values(rest).length;

  return (
    <KeyboardHelpContext.Provider value={{ setKeyboard, unsetKeyboard, hasContent }}>
      {children}
      <KeyboardHelpView help={rest} />
      <ConnectionStatus />
    </KeyboardHelpContext.Provider>
  );
};
