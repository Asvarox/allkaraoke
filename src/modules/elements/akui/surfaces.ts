/**
 * The surface a dialog-like element is built from: the modal `Menu`, the `Select` popup, the
 * `Autocomplete` menu, the bottom sheet, the lobby card, the expanded song preview.
 *
 * Opaque slate rather than the translucent black the in-game surfaces use. Those sit *in* the scene
 * and let the video through on purpose; a dialog sits on top of it and has to stay readable over
 * whatever happens to be behind it — over a dark backdrop, translucent black simply disappears. The
 * border is what actually reads as the edge once the fill stops contrasting with the scrim.
 *
 * Applied through `cn`/`twx`, so a caller can still override either half.
 */
export const dialogSurface = 'border border-white/10 bg-slate-800';
