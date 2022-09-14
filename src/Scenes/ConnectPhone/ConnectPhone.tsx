import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';
import { Link } from 'wouter';
import InputManager from '../Game/Singing/Input/InputManager';
import PhonesManager from './PhonesManager';
import WebRTCServer from './WebRTCServer';

function ConnectPhone() {
    useEffect(() => {
        WebRTCServer.start();
    }, []);

    const link = `${window.location.origin}/#/phone/${WebRTCServer.getRoomId()}`;

    return (
        <LayoutWithBackground>
            <MenuContainer>
                <QRCodeSVG value={link} width="100%" height="100%" includeMargin />
                <a href={link}>Connect to a server</a>
                <Link to={`/`}>
                    <MenuButton>Return to main menu</MenuButton>
                </Link>
                {PhonesManager.getPhones().map((phone) => (
                    <span>
                        {phone.name}
                        <button onClick={() => InputManager.setPlayerInput(0, 'Remote Microphone', 0, phone.id)}>
                            Set for Player 1
                        </button>
                        <button onClick={() => InputManager.setPlayerInput(1, 'Remote Microphone', 0, phone.id)}>
                            Set for Player 2
                        </button>
                    </span>
                ))}
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default ConnectPhone;
