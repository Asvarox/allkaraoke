import { omit } from 'es-toolkit';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';

import ConnectionStatus from '~/modules/remote-mic/connection-status';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import { ControlDescriptor, RemoteButtonIcon } from '~/routes/keyboard-help/controls';
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
  /** Human-readable name of the mirrored screen, shown as the header above the remote-mic keyboard. */
  title?: string;
  /**
   * Glyph shown beside `title` in that header, named from `remoteButtonIcons`. Lets a screen say what
   * it is at a glance (e.g. a pause glyph for the pause menu); defaults to a generic keyboard icon.
   */
  icon?: RemoteButtonIcon;
};

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

  // Republish whenever the active keyboard changes or its content is refreshed (`updateKeyboard`
  // produces a new `help` object), so mirrored control values stay live on the phone.
  useEffect(() => {
    RemoteMicServer.publish('keyboard-layout', help);
  }, [name, help]);

  // `title`/`icon` are metadata for the remote-mic header only — keep them out of `rest` so they
  // never leak into the on-screen `KeyboardHelpView` (which renders one row per key and has no view
  // for either), nor inflate its `hasContent` check.
  const { mode, remote, controls, title, icon, ...rest } = help ?? {};

  const hasContent = !!Object.values(rest).length;

  return (
    <KeyboardHelpContext value={{ setKeyboard, updateKeyboard, unsetKeyboard, hasContent }}>
      {children}
      <KeyboardHelpView help={rest} />
      <ConnectionStatus />
    </KeyboardHelpContext>
  );
};
