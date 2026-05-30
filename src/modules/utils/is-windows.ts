export default function isWindows() {
  return navigator?.userAgent?.includes?.('Win') ?? false;
}
