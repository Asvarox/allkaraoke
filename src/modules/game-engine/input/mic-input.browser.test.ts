import MicInput from './mic-input';

afterEach(async () => {
  await MicInput.stopMonitoring();
});

// The browser project feeds tests/fixtures/test-440hz.wav as the fake microphone
test('Mic input should properly return frequencies', async () => {
  await MicInput.startMonitoring();

  const frequencies: number[][] = [];

  await new Promise((resolve) => setTimeout(resolve, 200));
  for (let i = 0; i < 20; i++) {
    frequencies.push(await MicInput.getFrequencies());
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  frequencies.forEach((frequency) => {
    expect(Math.round(frequency[0])).toBeCloseTo(440, -1);
    expect(Math.round(frequency[1])).toBeCloseTo(440, -1);
  });
});
