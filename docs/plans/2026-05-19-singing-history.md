# Singing History Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "History" page accessible from the main menu that shows all songs sung on this device as a date-grouped, chronological feed with expandable entries.

**Architecture:** Play history is already stored in LocalForage per song via `SongStats`. A new `usePlayHistory` hook loads all stats and the song index, flattens them into a sorted list of `PlayHistoryEntry` objects, and groups them by calendar day. The `HistoryPage` renders date headers and expandable `PlayEntryCard` components with standard `useKeyboardNav` vertical navigation.

**Tech Stack:** React 19, TypeScript, Tailwind CSS (react-twc), wouter (routing), LocalForage (existing stats storage), dayjs (date formatting), react-use `useAsync` (async data loading), `useKeyboardNav` (keyboard navigation)

---

### Task 1: Add route path

**Files:**

- Modify: `src/routes/routePaths.ts`

**Step 1: Add the HISTORY route key**

In `src/routes/routePaths.ts`, add `HISTORY: 'history'` to the `routePaths` object (e.g. after `JUKEBOX`):

```typescript
const routePaths = {
  INDEX: '',
  QUICK_SETUP: 'quick-setup',
  GAME: 'game',
  MENU: 'menu',
  JUKEBOX: 'jukebox',
  HISTORY: 'history', // ← add this
  SELECT_INPUT: 'select-input',
  // ... rest unchanged
} as const;
```

**Step 2: Commit**

```bash
git add src/routes/routePaths.ts
git commit -m "feat(history): add HISTORY route path"
```

---

### Task 2: Write a failing E2E navigation test

**Files:**

- Create: `tests/PageObjects/HistoryPage.ts`
- Create: `tests/history.spec.ts`

**Step 1: Read the e2e-playwright skill to understand the project's test conventions**

Read file: `.agents/skills/e2e-playwright/SKILL.md`

**Step 2: Create the page object**

Create `tests/PageObjects/HistoryPage.ts`:

```typescript
import { Page } from '@playwright/test';

export class HistoryPage {
  constructor(private readonly page: Page) {}

  public get container() {
    return this.page.getByTestId('history-page');
  }

  public get emptyState() {
    return this.page.getByTestId('history-empty-state');
  }

  public get entries() {
    return this.page.getByTestId('history-entry');
  }

  public async expectEntryCount(count: number) {
    await this.entries.nth(count - 1).waitFor();
    const actual = await this.entries.count();
    if (actual !== count) throw new Error(`Expected ${count} entries, got ${actual}`);
  }

  public async navigateToEntry(index: number) {
    // Move keyboard focus to this entry (0-based index from top)
    for (let i = 0; i < index; i++) {
      await this.page.keyboard.press('ArrowDown');
    }
  }

  public async expandFocusedEntry() {
    await this.page.keyboard.press('Enter');
  }

  public get expandedDetails() {
    return this.page.getByTestId('history-entry-details');
  }
}
```

**Step 3: Look at tests/PageObjects/initialise.ts to understand how to register the new page object**

Open and read `tests/PageObjects/initialise.ts` — find how other page objects like `jukeboxPage` are registered, then add `historyPage` in the same pattern.

**Step 4: Create the test file**

Create `tests/history.spec.ts`:

```typescript
import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('History page', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Navigate from main menu to History', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToHistory();
    await pages.historyPage.container.waitFor();
  });

  await test.step('Shows empty state when no songs have been sung', async () => {
    await pages.historyPage.emptyState.waitFor();
  });

  await test.step('Back to menu via backspace', async () => {
    await page.keyboard.press('Backspace');
    await pages.mainMenuPage.waitForContainer();
  });
});
```

**Step 5: Run the test — expect it to fail**

Check the e2e-playwright skill for the exact command to run a single test file. It will fail because `goToHistory()` does not exist yet on the main menu page object, and the History page does not exist.

Expected output: test failure mentioning missing navigation or page not found.

**Step 6: Commit the failing test**

```bash
git add tests/PageObjects/HistoryPage.ts tests/history.spec.ts tests/PageObjects/initialise.ts
git commit -m "test(history): add failing E2E test for history page navigation"
```

---

### Task 3: Register the route in App.tsx and add menu button

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/routes/Welcome/Welcome.tsx`

**Step 1: Add the route to App.tsx**

In `src/App.tsx`, import `History` lazily (same pattern as `LazySongList`):

```typescript
const LazyHistory = lazy(() => import('~/routes/History/HistoryPage'));
```

Then add the route inside `<Switch>`, alongside the other routes (e.g. after the JUKEBOX route):

```tsx
<Route
  path={routePaths.HISTORY}
  component={() => (
    <Suspense fallback={<PageLoader />}>
      <LazyHistory />
    </Suspense>
  )}
/>
```

**Step 2: Add the History button to Welcome.tsx**

In `src/routes/Welcome/Welcome.tsx`, add a new `SmoothLink` + `Menu.Button` entry. Place it after the "Jukebox" button and before "Manage Songs":

```tsx
<SmoothLink to="history/">
  <Menu.Button {...register('history', () => navigate('history/'))}>History</Menu.Button>
</SmoothLink>
```

**Step 3: Add `goToHistory()` to the main menu page object**

Open `tests/PageObjects/MainMenuPage.ts` (or equivalent). Find the existing navigation methods (e.g. `goToJukebox()`). Add:

```typescript
public async goToHistory() {
  await this.page.getByTestId('history').click();
}
```

The `data-test` attribute value `'history'` is automatically set by `register('history', ...)` in `useKeyboardNav`.

**Step 4: Also add `waitForContainer()` to MainMenuPage if it doesn't exist**

If the main menu page object doesn't have a `waitForContainer()` method, add one that waits for a known element on the menu page (e.g. the "Sing a song" button).

**Step 5: Create a minimal HistoryPage stub so the route resolves**

Create `src/routes/History/HistoryPage.tsx` with a placeholder:

```tsx
function HistoryPage() {
  return <div data-test="history-page">History</div>;
}

export default HistoryPage;
```

**Step 6: Run the E2E test — expect steps 1 and 3 to pass, step 2 (empty state) to fail**

Check the e2e-playwright skill for the exact command.

Expected: navigation works, but `history-empty-state` element is not found.

**Step 7: Commit**

```bash
git add src/App.tsx src/routes/Welcome/Welcome.tsx src/routes/History/HistoryPage.tsx tests/PageObjects/MainMenuPage.ts
git commit -m "feat(history): add route, menu button, and page stub"
```

---

### Task 4: Implement `usePlayHistory` hook

**Files:**

- Create: `src/routes/History/usePlayHistory.ts`

**Step 1: Write a unit test for the data transformation logic**

Create `src/routes/History/usePlayHistory.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { groupEntriesByDay } from './usePlayHistory';

describe('groupEntriesByDay', () => {
  it('groups entries from the same calendar day under one header', () => {
    const entries = [
      { date: '2026-05-19T21:00:00.000Z', songKey: 'a', song: null, progress: 1, mode: 'DUEL', scores: [] },
      { date: '2026-05-19T20:00:00.000Z', songKey: 'b', song: null, progress: 1, mode: 'DUEL', scores: [] },
      { date: '2026-05-18T20:00:00.000Z', songKey: 'c', song: null, progress: 1, mode: 'DUEL', scores: [] },
    ] as any;

    const groups = groupEntriesByDay(entries);
    expect(groups).toHaveLength(2);
    expect(groups[0].entries).toHaveLength(2);
    expect(groups[1].entries).toHaveLength(1);
  });

  it('returns empty array for no entries', () => {
    expect(groupEntriesByDay([])).toEqual([]);
  });
});
```

**Step 2: Run the unit test — expect it to fail**

```bash
pnpm test src/routes/History/usePlayHistory.test.ts
```

Expected: FAIL — `groupEntriesByDay is not exported`

**Step 3: Implement `usePlayHistory.ts`**

Create `src/routes/History/usePlayHistory.ts`:

```typescript
import dayjs from 'dayjs';
import { useAsync } from 'react-use';
import { SingSetup, SongPreview } from '~/interfaces';
import SongsService from '~/modules/Songs/SongsService';
import { getAllStats, getSongKey } from '~/modules/Songs/stats/common';

export interface PlayHistoryEntry {
  songKey: string;
  // null when the song has been removed from the library
  song: SongPreview | null;
  date: string;
  progress: number | undefined;
  mode: SingSetup['mode'];
  scores: Array<{ name: string; score: number }>;
}

export interface PlayHistoryGroup {
  // Human-readable label: "Today", "Yesterday", or "18 May 2026"
  label: string;
  entries: PlayHistoryEntry[];
}

export function groupEntriesByDay(entries: PlayHistoryEntry[]): PlayHistoryGroup[] {
  const groups: PlayHistoryGroup[] = [];
  let currentDayKey = '';
  let currentGroup: PlayHistoryGroup | null = null;

  const today = dayjs();

  for (const entry of entries) {
    const entryDay = dayjs(entry.date);
    const dayKey = entryDay.format('YYYY-MM-DD');

    if (dayKey !== currentDayKey) {
      currentDayKey = dayKey;

      let label: string;
      if (entryDay.isSame(today, 'day')) {
        label = 'Today';
      } else if (entryDay.isSame(today.subtract(1, 'day'), 'day')) {
        label = 'Yesterday';
      } else {
        label = entryDay.format('D MMMM YYYY');
      }

      currentGroup = { label, entries: [] };
      groups.push(currentGroup);
    }

    currentGroup!.entries.push(entry);
  }

  return groups;
}

export function usePlayHistory(): { groups: PlayHistoryGroup[]; loading: boolean } {
  const statsAsync = useAsync(() => getAllStats(), []);
  const songIndexAsync = useAsync(() => SongsService.getIndex(), []);

  if (statsAsync.loading || songIndexAsync.loading || !statsAsync.value || !songIndexAsync.value) {
    return { groups: [], loading: true };
  }

  // Build hash → SongPreview lookup map
  const songsByKey = new Map<string, SongPreview>();
  for (const song of songIndexAsync.value) {
    songsByKey.set(getSongKey(song), song);
  }

  // Flatten all score entries across all songs
  const flatEntries: PlayHistoryEntry[] = [];
  for (const [key, stats] of Object.entries(statsAsync.value)) {
    const song = songsByKey.get(key) ?? null;
    for (const scoreEntry of stats.scores) {
      flatEntries.push({
        songKey: key,
        song,
        date: scoreEntry.date,
        progress: scoreEntry.progress,
        mode: scoreEntry.setup.mode,
        scores: scoreEntry.scores,
      });
    }
  }

  // Sort newest first
  flatEntries.sort((a, b) => b.date.localeCompare(a.date));

  return { groups: groupEntriesByDay(flatEntries), loading: false };
}
```

**Step 4: Run the unit test — expect it to pass**

```bash
pnpm test src/routes/History/usePlayHistory.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/routes/History/usePlayHistory.ts src/routes/History/usePlayHistory.test.ts
git commit -m "feat(history): add usePlayHistory data hook with unit tests"
```

---

### Task 5: Implement `PlayEntryCard` component

**Files:**

- Create: `src/routes/History/PlayEntryCard.tsx`

**Step 1: Understand how scores are displayed**

The `scores` array in a `PlayHistoryEntry` already has the right shape for display:

- In co-op mode it has one entry like `{ name: "Alex, Sam", score: 1240000 }`
- In duel/duet mode it has one entry per player

Score numbers should be formatted with `toLocaleString()` (e.g. `1,240,000`).

Game mode should be rendered as human-readable text:

- `DUEL` → "Duel"
- `CO_OP` → "Co-op"
- `PASS_THE_MIC` → "Pass the Mic"

Completion: `progress` is a 0–1 float — display as percentage (e.g. `Math.round(progress * 100) + '%'`). If `progress` is undefined, omit it.

**Step 2: Implement `PlayEntryCard.tsx`**

`PlayEntryCard` receives the spread result of `register(...)` as additional props, plus the entry data. The `focused` prop is provided by the register spread:

```tsx
import { twc } from 'react-twc';
import dayjs from 'dayjs';
import { GAME_MODE } from '~/interfaces';
import { PlayHistoryEntry } from './usePlayHistory';

const GAME_MODE_LABELS: Record<string, string> = {
  [GAME_MODE.DUEL]: 'Duel',
  [GAME_MODE.CO_OP]: 'Co-op',
  [GAME_MODE.PASS_THE_MIC]: 'Pass the Mic',
};

interface Props {
  entry: PlayHistoryEntry;
  isExpanded: boolean;
  focused: boolean;
  onClick: () => void;
  'data-test': string;
  'data-focused': boolean;
}

export function PlayEntryCard({ entry, isExpanded, focused, onClick, ...rest }: Props) {
  const songTitle = entry.song ? entry.song.title : 'Deleted song';
  const songArtist = entry.song ? entry.song.artist : '';
  const time = dayjs(entry.date).format('h:mm A');

  return (
    <Card data-focused={focused} onClick={onClick} {...rest}>
      <CollapsedRow>
        <SongInfo>
          <Title>{songTitle}</Title>
          {songArtist && <Artist>{songArtist}</Artist>}
        </SongInfo>
        <Time>{time}</Time>
      </CollapsedRow>

      {isExpanded && (
        <Details data-test="history-entry-details">
          <DetailRow>
            <span>Mode</span>
            <span>{GAME_MODE_LABELS[entry.mode] ?? entry.mode}</span>
          </DetailRow>
          {entry.progress !== undefined && (
            <DetailRow>
              <span>Completion</span>
              <span>{Math.round(entry.progress * 100)}%</span>
            </DetailRow>
          )}
          {entry.scores.map((score) => (
            <DetailRow key={score.name}>
              <span>{score.name}</span>
              <span>{score.score.toLocaleString()}</span>
            </DetailRow>
          ))}
        </Details>
      )}
    </Card>
  );
}

const Card = twc.div`data-[focused=true]:bg-active cursor-pointer rounded-lg px-6 py-4 transition-transform data-[focused=true]:scale-[1.025]`;
const CollapsedRow = twc.div`flex items-center justify-between gap-4`;
const SongInfo = twc.div`flex flex-col`;
const Title = twc.span`typography font-bold`;
const Artist = twc.span`typography text-sm opacity-70`;
const Time = twc.span`typography shrink-0 text-sm opacity-70`;
const Details = twc.div`mt-3 flex flex-col gap-1 border-t border-white/20 pt-3`;
const DetailRow = twc.div`typography flex justify-between text-sm`;
```

> Note: `data-[focused=true]:bg-active` is the Tailwind pattern used in other AKUI components for focus state. Check the Button component (`src/modules/Elements/AKUI/Button.tsx`) to confirm the exact class names used and align styling.

**Step 3: Commit**

```bash
git add src/routes/History/PlayEntryCard.tsx
git commit -m "feat(history): add PlayEntryCard expandable component"
```

---

### Task 6: Implement `HistoryPage` component

**Files:**

- Modify: `src/routes/History/HistoryPage.tsx`

**Step 1: Look at a settings page for layout reference**

Open `src/routes/Settings/RemoteMicSettings.tsx` to see how a non-game page uses `useKeyboardNav` + `onBackspace` + a back button. Use it as a structural reference for `HistoryPage`.

Also open `src/routes/Welcome/Welcome.tsx` to see how `MenuWithLogo` wraps a vertical list — consider whether to use `MenuWithLogo` or a custom layout. For a scrollable history list (potentially many items), a custom layout inside `LayoutGame` is more appropriate.

**Step 2: Implement `HistoryPage.tsx`**

```tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { twc } from 'react-twc';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import useSmoothNavigate from '~/modules/hooks/useSmoothNavigate';
import LayoutGame from '~/routes/LayoutGame';
import { PlayEntryCard } from './PlayEntryCard';
import { usePlayHistory } from './usePlayHistory';

function HistoryPage() {
  useBackground(true);
  const navigate = useSmoothNavigate();
  const { groups, loading } = usePlayHistory();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { register } = useKeyboardNav({ onBackspace: () => navigate('menu/') });

  const allEntries = groups.flatMap((group) => group.entries);
  const isEmpty = !loading && allEntries.length === 0;

  return (
    <LayoutGame>
      <Helmet>
        <title>History | AllKaraoke.Party</title>
      </Helmet>
      <Container data-test="history-page">
        <Header>History</Header>
        {loading && <Message>Loading…</Message>}
        {isEmpty && <Message data-test="history-empty-state">No songs sung yet — go sing something!</Message>}
        {groups.map((group) => (
          <section key={group.label}>
            <DateHeader>{group.label}</DateHeader>
            {group.entries.map((entry) => {
              // Unique key per play: song hash + timestamp
              const entryKey = `${entry.songKey}-${entry.date}`;
              const isExpanded = expandedKey === entryKey;

              return (
                <PlayEntryCard
                  key={entryKey}
                  entry={entry}
                  isExpanded={isExpanded}
                  data-test="history-entry"
                  {...register(entryKey, () => setExpandedKey(isExpanded ? null : entryKey))}
                />
              );
            })}
          </section>
        ))}
      </Container>
    </LayoutGame>
  );
}

const Container = twc.div`flex h-full flex-col gap-2 overflow-y-auto p-8`;
const Header = twc.h1`typography mb-4 text-3xl font-bold`;
const DateHeader = twc.h2`typography mt-6 mb-2 text-lg font-semibold opacity-70 first:mt-0`;
const Message = twc.p`typography opacity-70`;

export default HistoryPage;
```

> Note: Check what props `LayoutGame` accepts (open `src/routes/LayoutGame.tsx`). If it doesn't fit a scrollable list, use an alternative wrapper — look at how `ManageSongs` or `Settings` lay out their content.

**Step 3: Run the E2E test — all steps should now pass**

Check the e2e-playwright skill for the exact command to run `tests/history.spec.ts`.

Expected: all steps PASS (navigate to page, see empty state, backspace to menu).

**Step 4: Commit**

```bash
git add src/routes/History/HistoryPage.tsx
git commit -m "feat(history): implement history page with date groups and keyboard nav"
```

---

### Task 7: E2E test — entry appears after singing

**Files:**

- Modify: `tests/history.spec.ts`

**Step 1: Add a test that sings a song and checks history**

This test needs to complete a full song (or at least get a non-zero score) and then navigate to the history page to verify the entry appears.

Look at `tests/sing-a-song.spec.ts` (or similar) to understand how `pages.singASong` flow works — specifically how to start and finish a song quickly in test mode.

Add to `tests/history.spec.ts`:

```typescript
test('History entry appears after singing a song', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Sing a song', async () => {
    await pages.landingPage.enterTheGame();
    // Use existing page objects to pick a song and complete it
    // Look at sing-a-song.spec.ts for the exact steps
  });

  await test.step('Navigate to History', async () => {
    await pages.mainMenuPage.goToHistory();
    await pages.historyPage.container.waitFor();
  });

  await test.step('The sung song appears in the history', async () => {
    await pages.historyPage.expectEntryCount(1);
  });
});
```

> **Note:** Fill in the "Sing a song" step by studying `tests/sing-a-song.spec.ts`. You need to reach the post-game screen so the `songEnded` event fires and stats are stored. Look for a `finishSong` or `skipToEnd` helper in the page objects.

**Step 2: Run the test**

Check the e2e-playwright skill for the exact command.

Expected: PASS

**Step 3: Commit**

```bash
git add tests/history.spec.ts
git commit -m "test(history): add E2E test for entry appearing after singing"
```

---

### Task 8: Type-check and lint

**Step 1: Run type checking**

```bash
pnpm type-check
```

Fix any TypeScript errors before proceeding.

**Step 2: Run linting**

```bash
pnpm lint
```

Fix any lint errors.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(history): resolve type and lint issues"
```

---

## Summary of new files

| File                                        | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `src/routes/History/HistoryPage.tsx`        | Main page component              |
| `src/routes/History/PlayEntryCard.tsx`      | Expandable song play card        |
| `src/routes/History/usePlayHistory.ts`      | Data hook (load, flatten, group) |
| `src/routes/History/usePlayHistory.test.ts` | Unit tests for grouping logic    |
| `tests/PageObjects/HistoryPage.ts`          | Page object for E2E tests        |
| `tests/history.spec.ts`                     | E2E tests                        |

## Modified files

| File                                | Change                                   |
| ----------------------------------- | ---------------------------------------- |
| `src/routes/routePaths.ts`          | Add `HISTORY: 'history'`                 |
| `src/App.tsx`                       | Register lazy-loaded `HistoryPage` route |
| `src/routes/Welcome/Welcome.tsx`    | Add History menu button                  |
| `tests/PageObjects/initialise.ts`   | Register `historyPage` page object       |
| `tests/PageObjects/MainMenuPage.ts` | Add `goToHistory()` method               |
