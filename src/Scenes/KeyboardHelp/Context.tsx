import events from 'GameEvents/GameEvents';
import { useEventEffect } from 'GameEvents/hooks';
import { omit } from 'lodash-es';
import { createContext, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import KeyboardHelpView from './HelpView';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'shiftR';

type remoteActions = 'search';

export type RegularHelpEntry = Partial<Record<keys, string | null>>;
export type HelpEntry = RegularHelpEntry & { remote?: remoteActions[] };

export const KeyboardHelpContext = createContext({
  setKeyboard: (name: string, helpEntry: HelpEntry): void => {},
  unsetKeyboard: (name: string): void => {},
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

  return (
    <KeyboardHelpContext.Provider value={{ setKeyboard, unsetKeyboard }}>
      {children}
      <KeyboardHelpView help={rest} />
    </KeyboardHelpContext.Provider>
  );
};
