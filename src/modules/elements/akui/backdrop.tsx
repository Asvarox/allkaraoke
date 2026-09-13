import { motion } from 'motion/react';

import { twx } from '~/utils/twx';

/**
 * The scrim behind anything that opens on top of the app — the modal, the expanded song preview, the
 * bottom sheet.
 *
 * The dot screen and the heavy blur are the point, not decoration: the game's video keeps playing
 * underneath, and a flat tint alone reads as "the screen got darker" rather than "a layer opened
 * above it". `bg-black/50` is deliberately light enough to leave that motion visible.
 *
 * Built on `motion.div` so callers can animate it in and out, but it renders fine as a plain element
 * when they don't. Stacking is the caller's business — pass the z-index through `className`, since
 * each surface knows which layer it claims.
 */
export const Backdrop = twx(
  motion.div,
)`fixed inset-0 bg-black/50 [background-image:radial-gradient(transparent_3px,rgba(0,0,0,0.5)_3px)] [background-size:10px_10px] backdrop-blur-[20px]`;

export default Backdrop;
