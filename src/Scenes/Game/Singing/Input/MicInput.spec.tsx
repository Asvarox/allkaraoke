import { expect, test } from '@playwright/experimental-ct-react';
import { MicInputCtStory } from './MicInput.ct-story';

test('Mic input should properly return frequencies', async ({ mount, page }) => {
  const component = await mount(<MicInputCtStory />);

  const frequencies = await page.evaluate(async () => {
    const { MicInput } = window;

    await MicInput.startMonitoring();

    const frequencies: [number, number][] = [];

    await new Promise((resolve) => setTimeout(resolve, 100));
    for (let i = 0; i < 20; i++) {
      frequencies.push(await MicInput.getFrequencies());
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return frequencies;
  });

  frequencies.forEach((frequency) => {
    expect(Math.round(frequency[0])).toBeCloseTo(440, -1);
    expect(Math.round(frequency[1])).toBeCloseTo(440, -1);
  });
});
