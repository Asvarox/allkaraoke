// @ts-ignore
import * as ml5 from 'ml5';
import { useEffect, useRef } from 'react';

const PT_OFFSET = 24.374;
const PT_SLOPE = 62.511;

function usePitch4() {
    // const [pitch, setPitch] = useState(0);
    let start = useRef<any>(() => undefined);
    const pitch = useRef(0);

    useEffect(() => {
        const NUM_INPUT_SAMPLES = 1 << 12;

        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            let context = new AudioContext();

            let detector = await ml5.pitchDetection('CREPE', context, stream);

            setInterval(() => {
                detector.getPitch((err: any, frequency: number | undefined) => {
                    pitch.current = frequency ?? 0;
                });
            }, 100);
        })();
    }, []);

    return [() => pitch.current, start.current];
}

export default usePitch4;
