import { omit } from 'es-toolkit';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import ConnectionStatus from '~/modules/remote-mic/connection-status';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import { ControlDescriptor } from '~/routes/keyboard-help/controls';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';
import KeyboardHelpView from './help-view';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'shiftR' | 'alphanumeric';

type remoteActions = 'search' | 'select-song';

/**
 * Which layout the remote-mic keyboard panel renders. Add a new member here and the phone's
 * exhaustive `switch` (guarded by `assertNever`) will force you to add its renderer.
 *  - `classic`: generic arrow + accept/back navigation (the default).
 *  - `mirror`: the screen's own controls, mirrored 1:1 (see `controls`).
 *  - `song-selection`: the bespoke song browser (search + arrows + random, extended over time).
 */
export type KeyboardLayoutMode = 'classic' | 'mirror' | 'song-selection';

export type RegularHelpEntry = Partial<Record<keys, string | null>>;
/**
 * The layout pushed to remote mics. `mode` selects the phone renderer (defaults to `classic`).
 * `controls` carries the mirrored descriptors (`mode: 'mirror'`). `remote` flags orthogonal
 * capabilities (song search, select-song) consumed across panels, independent of `mode`.
 */
export type HelpEntry = RegularHelpEntry & {
  mode?: KeyboardLayoutMode;
  remote?: remoteActions[];
  controls?: ControlDescriptor[];
};

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

  // Pick the active layout. Normally the most-recently-registered keyboard wins (`.at(-1)`), but a
  // `mirror` screen is an unambiguous "this is the interactive screen" signal, so it takes priority
  // over background keyboards (e.g. a menu left mounted underneath) whose focus churn would otherwise
  // steal the selection. Classic/song-selection ordering is unaffected (they have no mirror entry).
  const entries = Object.entries(keyboards);
  const [, help] = entries.filter(([, entry]) => entry.mode === 'mirror').at(-1) ?? entries.at(-1) ?? [];

  // Republish whenever the layout content changes (not just when the active keyboard changes),
  // so mirrored control values (checked/unchecked, switch value, focus) stay live on the phone.
  const serializedHelp = JSON.stringify(help ?? null);
  useEffect(() => {
    RemoteMicServer.publish('keyboard-layout', help);
  }, [serializedHelp]);

  const { mode, remote, controls, ...rest } = help ?? {};

  const hasContent = !!Object.values(rest).length;

  return (
    <KeyboardHelpContext value={{ setKeyboard, unsetKeyboard, hasContent }}>
      {children}
      <KeyboardHelpView help={rest} />
      <ConnectionStatus />
    </KeyboardHelpContext>
  );
};
