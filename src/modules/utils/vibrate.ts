/**
 * Safely triggers device vibration if supported by the browser.
 * Silently ignores errors (e.g. permission denied, unsupported device).
 */
export default function vibrate(pattern: number | number[] = 200) {
  if (!navigator.vibrate) return;

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.error('Vibration failed:', error);
  }
}
