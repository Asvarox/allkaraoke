import * as tf from '@tensorflow/tfjs';
import { useEffect, useRef } from 'react';

const PT_OFFSET = 24.374;
const PT_SLOPE = 62.511;

function getPitchHz(modelPitch: number) {
    const fmin = 10.0;
    const bins_per_octave = 12.0;
    const cqt_bin = modelPitch * PT_SLOPE + PT_OFFSET;
    return fmin * Math.pow(2.0, (1.0 * cqt_bin) / bins_per_octave);
}

function usePitch() {
    // const [pitch, setPitch] = useState(0);
    const pitch = useRef(0);
    let start: any;

    useEffect(() => {
        const NUM_INPUT_SAMPLES = 1024;
        const MODEL_SAMPLE_RATE = 16000;
        const CONF_THRESHOLD = 0.9;
        const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/spice/1/default/1';

        (async () => {
            const model = await tf.loadGraphModel(MODEL_URL, {
                fromTFHub: true,
            });

            // const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            let context = new AudioContext({
                latencyHint: 'playback',
                sampleRate: MODEL_SAMPLE_RATE,
            });

            let theBuffer: any = await new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open('GET', './demo.mp3', true);
                request.responseType = 'arraybuffer';
                request.onload = function () {
                    context.decodeAudioData(
                        request.response,
                        function (buffer) {
                            resolve(buffer);
                        },
                        reject,
                    );
                };
                request.send();
            });
            let source = context.createBufferSource();
            source.buffer = theBuffer;
            source.loop = true;

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
                const input = tf.reshape(tf.tensor(inputData), [NUM_INPUT_SAMPLES]);
                const output = model.execute({
                    input_audio_samples: input,
                }) as tf.Tensor<tf.Rank>[];
                const uncertainties = output[0].dataSync();
                const pitches = output[1].dataSync();

                for (let i = 0; i < pitches.length; ++i) {
                    let confidence = 1.0 - uncertainties[i];
                    if (confidence < CONF_THRESHOLD) {
                        pitch.current = 0;
                    } else {
                        pitch.current = getPitchHz(pitches[i]);
                    }

                    console.log(pitch.current, confidence);
                }
            };
            start = () => source.start(0);
        })();
    }, []);

    return [() => pitch.current, start];
}

export default usePitch;
