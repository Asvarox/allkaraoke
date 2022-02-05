import { useState } from 'react';
import { MenuContainer } from '../../Elements/Menu';
import WebRTCClient from './WebRTCClient';

interface Props {
    roomId: string;
}

function Phone({ roomId }: Props) {
    const [name, setName] = useState('Olek');

    return (
        <MenuContainer>
            <input onChange={(e) => setName(e.target.value)} value={name} />
            <button onClick={() => WebRTCClient.connect(roomId, name)}>Connect</button>
        </MenuContainer>
    );
}
export default Phone;
