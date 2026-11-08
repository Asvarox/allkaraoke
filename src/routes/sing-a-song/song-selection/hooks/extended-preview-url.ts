import { useSearch } from 'wouter';

const EXTEND_PARAM = 'extend';
// Marks the history entry pushed when opening the preview - the entry before it is the song list
const HISTORY_STATE_KEY = 'songPreviewExtended';

const isExtendedInUrl = () => new URLSearchParams(global.location?.search).has(EXTEND_PARAM);

const buildUrl = (extended: boolean, url = new URL(global.location.href)) => {
  url.searchParams.delete(EXTEND_PARAM);
  if (!extended) return url.toString();

  // Valueless flag (`&extend`) rather than `&extend=`
  const search = url.searchParams.toString();
  url.search = search ? `${search}&${EXTEND_PARAM}` : EXTEND_PARAM;
  return url.toString();
};

/** The song preview is extended when the URL has the `extend` param */
export const useIsPreviewExtended = () => new URLSearchParams(useSearch()).has(EXTEND_PARAM);

/** Pushes a history entry, so the browser back button closes the preview */
export const openExtendedPreview = () => {
  if (!isExtendedInUrl()) global.history.pushState({ [HISTORY_STATE_KEY]: true }, '', buildUrl(true));
};

/** Steps back to the song list entry if we pushed one (otherwise e.g. opened from a link), resolving once the URL is updated */
export const closeExtendedPreview = () =>
  new Promise<void>((resolve) => {
    if (!isExtendedInUrl()) return resolve();
    if (!global.history.state?.[HISTORY_STATE_KEY]) {
      global.history.replaceState(null, '', buildUrl(false));
      return resolve();
    }
    global.addEventListener('popstate', () => resolve(), { once: true });
    global.history.back();
  });

/** Replaces a query param in the current history entry, keeping its state and the `extend` flag intact */
export const replaceSearchParam = (name: string, value: string) => {
  const url = new URL(global.location.href);
  url.searchParams.set(name, value);
  global.history.replaceState(global.history.state, '', buildUrl(isExtendedInUrl(), url));
};
