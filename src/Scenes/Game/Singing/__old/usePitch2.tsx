import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import PitchAnalyzer from './pitch';

const PT_OFFSET = 24.374;
const PT_SLOPE = 62.511;

function getPitchHz(modelPitch: number) {
    const fmin = 10.0;
    const bins_per_octave = 12.0;
    const cqt_bin = modelPitch * PT_SLOPE + PT_OFFSET;
    return fmin * Math.pow(2.0, (1.0 * cqt_bin) / bins_per_octave);
}

const analyzer = new PitchAnalyzer(44100);

let start: any;

function usePitch2() {
    // const [pitch, setPitch] = useState(0);
    const pitch = useRef(0);

    useEffect(() => {
        const MODEL_SAMPLE_RATE = 44100;
        const NUM_INPUT_SAMPLES = 4096;

        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            let context = new AudioContext();

            //   let theBuffer: any = await new Promise((resolve, reject) => {
            //     const request = new XMLHttpRequest();
            //     request.open('GET', './test2.mp3', true);
            //     request.responseType = 'arraybuffer';
            //     request.onload = function() {
            //         context.decodeAudioData(request.response, function(buffer) {
            //           resolve(buffer)
            //     }, reject);
            //     }
            //     request.send();
            // });

            // let source = context.createBufferSource();
            // source.buffer = theBuffer;
            // source.loop = true;

            let source = context.createMediaStreamSource(stream);
            let processor = context.createScriptProcessor(
                NUM_INPUT_SAMPLES,
                /*num_inp_channels=*/ 1,
                /*num_out_channels=*/ 1,
            );

            // Converts audio to mono.
            processor.channelInterpretation = 'speakers';
            processor.channelCount = 1;

            // Runs processor on audio source.
            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = function (e) {
                const inputData = e.inputBuffer.getChannelData(0);

                analyzer.input(inputData);
                analyzer.process();
                var tone = analyzer.findTone();

                pitch.current = tone?.freq ?? 0;
            };

            // @ts-ignore
            start = () => {
                // source.start(0);
            };
        })();
    }, []);

    return [() => pitch.current, start];
}

export default usePitch2;
