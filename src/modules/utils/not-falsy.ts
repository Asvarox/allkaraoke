export default function notFalsy<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}
