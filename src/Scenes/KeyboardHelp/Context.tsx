import { omit } from 'lodash-es';
import { createContext, FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import KeyboardHelpView from './HelpView';
import PhoneManager from 'RemoteMic/PhoneManager';
import { useEventEffect } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'shiftR';

export type HelpEntry = Partial<Record<keys, string | null>>;

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

    useEventEffect(events.phoneConnected, ({ id }) => {
        PhoneManager.getPhoneById(id)?.connection.send({
            t: 'keyboard-layout',
            help,
        });
    });

    useEffect(() => {
        PhoneManager.broadcast({
            t: 'keyboard-layout',
            help,
        });
    }, [name]);

    return (
        <KeyboardHelpContext.Provider value={{ setKeyboard, unsetKeyboard }}>
            {children}
            <KeyboardHelpView help={help} />
        </KeyboardHelpContext.Provider>
    );
};
