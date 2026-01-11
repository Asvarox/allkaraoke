import { omit } from 'es-toolkit';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect } from '~/modules/GameEvents/hooks';
import ConnectionStatus from '~/modules/RemoteMic/ConnectionStatus';
import RemoteMicManager from '~/modules/RemoteMic/RemoteMicManager';
import { KeyboardHelpContext } from '~/routes/KeyboardHelp/KeyboardHelpContext';
import KeyboardHelpView from './HelpView';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'shiftR' | 'alphanumeric';

type remoteActions = 'search' | 'select-song';

export type RegularHelpEntry = Partial<Record<keys, string | null>>;
export type HelpEntry = RegularHelpEntry & { remote?: remoteActions[] };

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
    <KeyboardHelpContext value={{ setKeyboard, unsetKeyboard, hasContent }}>
      {children}
      <KeyboardHelpView help={rest} />
      <ConnectionStatus />
    </KeyboardHelpContext>
  );
};
