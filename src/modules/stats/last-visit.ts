import storage from '~/modules/utils/storage';

const CURRENT_VISIT_KEY = 'CURRENT_VISIT_KEY';
const LAST_VISIT_KEY = 'LAST_VISIT_KEY';

const VISIT_TIMEOUT_MS = 3 * 60 * 60 * 1_000;

const currentTime = Date.now();
const currentVisit = Number(storage.local?.getItem(CURRENT_VISIT_KEY) ?? currentTime);

// One of the few ways to determine if user already visited the site before
// Note that this is simulated in E2E tests - adjust them if you change this
const isFirstVisit = storage.local?.getItem('posthog-user-id') === null;

// If it's the first visit, don't show new songs
// If the user visited the site before, show new songs added since the functionality was implemented
const defaultLastVisit = isFirstVisit ? currentTime : 1673642382501; // implementation time
let lastVisit = Number(storage.local?.getItem(LAST_VISIT_KEY) ?? defaultLastVisit);

if (isFirstVisit || currentTime - currentVisit > VISIT_TIMEOUT_MS) {
  storage.local?.setItem(LAST_VISIT_KEY, String(currentVisit));
  lastVisit = currentVisit;
}
storage.local?.setItem(CURRENT_VISIT_KEY, String(currentTime));

export { lastVisit };
