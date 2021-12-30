import { useEffect, useRef, useState } from 'react';
import aubio from 'aubiojs';

const PT_OFFSET = 24.374;
const PT_SLOPE = 62.511;

function usePitch3() {
  // const [pitch, setPitch] = useState(0);
  let start = useRef<any>(() => undefined);
  const pitch1 = useRef(0);
  const pitch2 = useRef(0);

  useEffect(() => {
    const NUM_INPUT_SAMPLES = 1 << 12;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,
      }, video: false,  });
      let context = new AudioContext();

      // let theBuffer: any = await new Promise((resolve, reject) => {
      //   const request = new XMLHttpRequest();
      //   request.open('GET', './test2.mp3', true);
      //   request.responseType = 'arraybuffer';
      //   request.onload = function() {
      //       context.decodeAudioData(request.response, function(buffer) {
      //         resolve(buffer)
      //   }, reject);
      //   }
      //   request.send();
      // });

      // let source = context.createBufferSource();
      // source.buffer = theBuffer;
      // source.loop = true;

      const source = context.createMediaStreamSource(stream);


      start.current = () => {
        console.log(source);
        // @ts-ignore
        source?.start(0);
      };


      
      // let source = context.createMediaStreamSource(stream);
      let processor = context.createScriptProcessor(
        NUM_INPUT_SAMPLES
        );
        
        // Runs processor on audio source.
        source.connect(processor);
        processor.connect(context.destination);
        
        const { Pitch } = await aubio();

        const detector = new Pitch('default', processor.bufferSize, processor.bufferSize / 8, context.sampleRate);

// @ts-ignore
              detector.setTolerance(.2);
      processor.onaudioprocess = function(e) {
        const inputData1 = e.inputBuffer.getChannelData(0);
        const inputData2 = e.inputBuffer.getChannelData(1);

        const frequency1 = detector.do(inputData1);
        const frequency2 = detector.do(inputData2);

        pitch1.current = frequency1 ?? 0;
        pitch2.current = frequency2 ?? 0;
        // console.log(frequency);
      }
    })();
  }, []);

  return [() => pitch1.current, () => pitch2.current];
}

export default usePitch3;
