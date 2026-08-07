import isE2E from '~/modules/utils/is-e2-e';

/** `Element.scrollIntoView`, but instant (not animated) during e2e tests so screenshots aren't taken mid-scroll. */
export default function scrollIntoView(
  element: Element | null | undefined,
  options: Omit<ScrollIntoViewOptions, 'behavior'> = {},
) {
  element?.scrollIntoView({ ...options, behavior: isE2E() ? 'instant' : 'smooth' });
}
