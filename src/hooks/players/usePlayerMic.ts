import { useEffect, useState } from 'react';
import { FPSCountSetting } from 'Scenes/Settings/SettingsState';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import tuple from 'utils/tuple';

const usePlayerMic = (
    playerNumber: number,
    intervalMs = 1000 / FPSCountSetting.get(),
    onMeasure?: ([volume, frequency]: [number, number]) => void,
) => {
    const [data, setData] = useState(tuple([0, 0]));
    useEffect(() => {
        const interval = setInterval(() => {
            const playerVolume = InputManager.getPlayerVolume(playerNumber) ?? 0;
            const playerFrequency = InputManager.getPlayerFrequency(playerNumber) ?? 0;
            setData([playerVolume, Array.isArray(playerFrequency) ? playerFrequency[0] : playerFrequency]);
        }, intervalMs);

        return () => {
            clearInterval(interval);
        };
    }, [playerNumber, intervalMs]);

    useEffect(() => {
        if (onMeasure) {
            onMeasure(data);
        }
    }, [data, onMeasure]);

    return data;
};

export default usePlayerMic;
