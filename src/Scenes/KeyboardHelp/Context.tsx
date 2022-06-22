import { omit } from 'lodash';
import { createContext, FunctionComponent, PropsWithChildren, useState } from 'react';
import KeyboardHelpView from './HelpView';

type keys = 'horizontal' | 'vertical' | 'horizontal-vertical' | 'accept' | 'back' | 'letterF';

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

    const help = Object.values(keyboards).at(-1);

    return (
        <KeyboardHelpContext.Provider value={{ setKeyboard, unsetKeyboard }}>
            {children}
            <KeyboardHelpView help={help} />
        </KeyboardHelpContext.Provider>
    );
};
