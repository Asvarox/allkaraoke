import { MenuButton, MenuContainer } from 'Elements/Menu';
import { useEffect } from 'react';
import { Link } from 'wouter';
import GameStateEvents from '../Game/Singing/GameState/GameStateEvents';
import useEventListener from '../Game/Singing/Hooks/useEventListener';
import InputManager from '../Game/Singing/Input/InputManager';
import PhonesManager from './PhonesManager';
import WebRTCServer from './WebRTCServer';

function ConnectPhone() {
    useEffect(() => {
        WebRTCServer.start();
    }, []);

    const data1 = useEventListener(GameStateEvents.phoneConnected);
    const data2 = useEventListener(GameStateEvents.phoneDisconnected);

    console.log(data1, data2);

    return (
        <MenuContainer>
            <Link to={`/phone/${WebRTCServer.getRoomId()}`}>
                <a>Connect to a server</a>
            </Link>
            <Link to={`/`}>
                <MenuButton>Return to main menu</MenuButton>
            </Link>
            {PhonesManager.getPhones().map((phone) => (
                <span>
                    {phone.name}
                    <button onClick={() => InputManager.setPlayerInput(0, phone.getInput(), 0)}>
                        Set for Player 1
                    </button>
                    <button onClick={() => InputManager.setPlayerInput(1, phone.getInput(), 0)}>
                        Set for Player 2
                    </button>
                </span>
            ))}
        </MenuContainer>
    );
}
export default ConnectPhone;
