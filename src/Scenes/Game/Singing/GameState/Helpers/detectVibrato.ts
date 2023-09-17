import { FrequencyRecord } from 'interfaces';

const WINDOW_SIZE = 6;

export default function detectVibrato(data: FrequencyRecord[]): boolean {
  const opChangePoints: Array<FrequencyRecord & { change: '>' | '<'; interval: number }> = [];

  for (let i = 1; i < data.length; i++) {
    if (Math.round(data[i].frequency / 2) === Math.round(data[i - 1].frequency / 2)) continue;

    const change = data[i].frequency > data[i - 1].frequency ? '>' : '<';
    if (opChangePoints.length === 0) {
      opChangePoints.push({
        ...data[i],
        interval: data[i].timestamp - data[i - 1].timestamp,
        change,
      });
    } else {
      const lastChange = opChangePoints.at(-1)!;
      if (lastChange.change !== change) {
        opChangePoints.push({
          ...data[i],
          interval: data[i].timestamp - lastChange.timestamp,
          change,
        });
      }
    }
  }

  const changePoints = opChangePoints;

  for (let i = 0; i < changePoints.length - WINDOW_SIZE; i++) {
    const window = changePoints.slice(i, i + WINDOW_SIZE - 1);

    const intervals = window.map((record) => record.interval);
    // const pitches = window.map((record) => record.pitch);
    const maxInterval = Math.max(...intervals);
    const minInterval = Math.min(...intervals);

    const averageIntervals = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

    if (maxInterval < averageIntervals * 1.75 && minInterval > averageIntervals / 1.75) return true;
  }

  return false;
}
