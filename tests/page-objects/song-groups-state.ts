import { Page } from '@playwright/test';

export interface SongGroupState {
  name: string;
  /** The group's header is scrolled into view in the song list — full highlight. */
  visible: boolean;
  /** The group holds the currently selected song — subtle highlight. */
  subtle: boolean;
}

/**
 * Reads the song groups row off whichever page is passed. The song selection screen and the remote
 * mic render the row with the same test ids and highlight attributes, so a single reader lets a test
 * compare the two sides directly instead of asserting each one against hardcoded expectations.
 */
export async function songGroupsState(page: Page): Promise<SongGroupState[]> {
  return page.locator('[data-test^="group-navigation-"]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      name: node.getAttribute('data-test')!.replace('group-navigation-', ''),
      visible: node.getAttribute('data-active') === 'true',
      subtle: node.getAttribute('data-subtle-focus') === 'true',
    })),
  );
}
