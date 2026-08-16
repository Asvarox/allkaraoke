import { twx } from '~/utils/twx';

/** Inline pill label (host / ready / disconnected / …). `relative` so it stays above the volume bar
 * of the row it sits in. */
export const Tag = twx.span`bg-active text-default relative rounded-full px-2 text-xs`;
