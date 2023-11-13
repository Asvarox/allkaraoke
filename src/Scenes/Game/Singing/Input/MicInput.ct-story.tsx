import { useEffect } from 'react';
import MicInput from './MicInput';

declare global {
  interface Window {
    MicInput: typeof MicInput;
  }
}

export const MicInputCtStory = () => {
  useEffect(() => {
    window.MicInput = MicInput;
  }, []);
  return (
    <div>
      <h1>Just adding MicInput to the window</h1>
    </div>
  );
};
