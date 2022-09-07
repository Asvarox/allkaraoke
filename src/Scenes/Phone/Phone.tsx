import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuContainer } from 'Elements/Menu';
import { useEffect, useState } from 'react';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import WebRTCClient from './WebRTCClient';

interface Props {
    roomId: string;
}

function Phone({ roomId }: Props) {
    const [name, setName] = useState('Olek');
    const [currentFrequency, setCurrentFrequency] = useState(0);
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        MicInput.startMonitoring();
        return MicInput.addListener((freqs, volumes) => {
            setCurrentFrequency(freqs[0]);
            setVolume(volumes[0]);
        });
    }, []);

    return (
        <LayoutWithBackground>
            <MenuContainer>
                <h2>{currentFrequency}</h2>
                <h2>{volume}</h2>
                <input onChange={(e) => setName(e.target.value)} value={name} />
                <button onClick={() => WebRTCClient.connect(roomId, name)}>Connect</button>
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default Phone;
