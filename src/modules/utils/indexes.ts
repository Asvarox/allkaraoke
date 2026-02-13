import { ValuesType } from 'utility-types';

export function nextIndex<T>(values: readonly T[], current: number, direction: 1 | -1 = 1): number {
  return direction === 1 ? (current + 1) % values.length : (current + values.length - 1) % values.length;
}

export function nextValueIndex<T>(values: readonly T[], current: ValuesType<T[]>, direction: 1 | -1 = 1): number {
  return nextIndex(values, values.indexOf(current), direction);
}

export function nextValue<T>(values: readonly T[], current: ValuesType<T[]>, direction: 1 | -1 = 1): ValuesType<T[]> {
  return values[nextValueIndex(values, current, direction)];
}
