import { useEffect } from 'react';

import MicInput from './mic-input';

declare global {
  var micInput: typeof MicInput;
}

export const MicInputCtStory = () => {
  useEffect(() => {
    global.micInput = MicInput;
  }, []);
  return (
    <div>
      <h1 className="text-2xl">Just adding MicInput to the window</h1>
    </div>
  );
};
