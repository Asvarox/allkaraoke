import { useEffect } from 'react';
import MicInput from './MicInput';

declare global {
  var micInput: typeof MicInput;
}

export const MicInputCtStory = () => {
  useEffect(() => {
    globalThis.micInput = MicInput;
  }, []);
  return (
    <div>
      <h1>Just adding MicInput to the window</h1>
    </div>
  );
};
