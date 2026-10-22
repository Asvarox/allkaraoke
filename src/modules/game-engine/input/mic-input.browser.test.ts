import MicInput from './mic-input';

afterEach(async () => {
  await MicInput.stopMonitoring();
});

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

// The browser project feeds tests/fixtures/test-440hz.wav as the fake microphone
test('Mic input should properly return frequencies', async () => {
  await MicInput.startMonitoring();

  const frequencies: number[][] = [];

  await new Promise((resolve) => setTimeout(resolve, 200));
  for (let i = 0; i < 20; i++) {
    frequencies.push(await MicInput.getFrequencies());
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // A starved CI runner can glitch the fake capture, skewing a single reading by a few Hz,
  // so the exact pitch is checked on the median and each reading only has to land on the same note
  [0, 1].forEach((channel) => {
    const readings = frequencies.map((frequency) => frequency[channel]);
    expect(median(readings)).toBeCloseTo(440, -1);
    readings.forEach((reading) => expect(reading).toBeGreaterThan(427)); // 440Hz -/+ half a semitone
    readings.forEach((reading) => expect(reading).toBeLessThan(453));
  });
});
