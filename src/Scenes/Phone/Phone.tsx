import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuContainer } from 'Elements/Menu';
import { useState } from 'react';
import WebRTCClient from './WebRTCClient';

interface Props {
    roomId: string;
}

function Phone({ roomId }: Props) {
    const [name, setName] = useState('Olek');

    return (
        <LayoutWithBackground>
            <MenuContainer>
                <input onChange={(e) => setName(e.target.value)} value={name} />
                <button onClick={() => WebRTCClient.connect(roomId, name)}>Connect</button>
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default Phone;
