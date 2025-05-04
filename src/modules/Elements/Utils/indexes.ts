import { ValuesType } from 'utility-types';

export function nextIndex<T extends readonly any[]>(values: T, current: number, direction: 1 | -1 = 1): number {
  return direction === 1 ? (current + 1) % values.length : (current + values.length - 1) % values.length;
}

export function nextValueIndex<T extends readonly any[]>(
  values: T,
  current: ValuesType<T>,
  direction: 1 | -1 = 1,
): number {
  return nextIndex(values, values.indexOf(current), direction);
}

export function nextValue<T extends readonly any[]>(
  values: T,
  current: ValuesType<T>,
  direction: 1 | -1 = 1,
): ValuesType<T> {
  return values[nextValueIndex(values, current, direction)];
}
