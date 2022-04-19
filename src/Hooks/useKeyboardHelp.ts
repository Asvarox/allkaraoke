import { useContext, useRef } from 'react';
import { HelpEntry, KeyboardHelpContext } from 'Scenes/KeyboardHelp/Context';

export default function useKeyboardHelp() {
    const name = useRef(String(Math.random()));
    const { setKeyboard, unsetKeyboard } = useContext(KeyboardHelpContext);

    const setHelp = (help: HelpEntry) => {
        setKeyboard(name.current, help);
    };

    const clearHelp = () => unsetKeyboard(name.current);

    return { setHelp, clearHelp };
}
