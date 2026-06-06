# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hidden `/admin` panel for listing, deleting, reindexing, and editing unverified shared songs stored in Cloudflare KV.

**Architecture:** Add a dedicated browser-admin API under `/admin/*`, protected by a separate password header and backed by the existing shared-song KV store helpers. Add a hidden React route that stores the password in `sessionStorage`, shows a client-filtered/sorted `MaterialReactTable`, and opens the existing song editor in admin mode so saves update both local storage and the stable KV record.

**Tech Stack:** Cloudflare Pages Functions, KV, React 19, wouter, Material UI, material-react-table, Vitest, Playwright.

---

## Important Context

- Baseline branch is `master`.
- React Compiler is enabled, so do not add manual memoization unless the surrounding code already requires it.
- The existing CI admin endpoint is `functions/shared-songs-admin.ts`; keep it token-protected and CI-oriented.
- The new browser admin password should be separate from `SHARED_SONGS_ADMIN_TOKEN`, for example `SHARED_SONGS_ADMIN_PASSWORD`.
- The current shared-song index does not store `externalSongId`; it currently infers it from `songId`. Admin edits must keep `externalSongId` stable even when a corrected song gets a new `songId`, so the index must be extended first.

## Task 1: Extend Shared-Song Store for Stable External IDs

**Files:**

- Modify: `functions/shared-songs-store.ts`
- Modify: `functions/shared-songs-store.test.ts`
- Modify: `functions/shared-songs.ts`

**Step 1: Write failing store tests**

Add tests that prove the index carries `externalSongId` and that updates preserve the original KV key.

In `functions/shared-songs-store.test.ts`, import the future update helper:

```ts
import {
  getSharedSong,
  listSharedSongs,
  removeSharedSong,
  SharedSongRecord,
  updateSharedSong,
  upsertSharedSong,
} from './shared-songs-store';
```

Add tests:

```ts
it('lists records with stable external song ids', async () => {
  const kv = new MockKVNamespace();
  await upsertSharedSong(kv, createRecord({ externalSongId: 'external-1', songId: 'generated-1' }));

  const list = await listSharedSongs(kv);

  expect(list[0]).toMatchObject({
    externalSongId: 'external-1',
    songId: 'generated-1',
  });
});

it('updates a shared song in place while preserving externalSongId', async () => {
  const kv = new MockKVNamespace();
  await upsertSharedSong(kv, createRecord({ externalSongId: 'external-1', songId: 'old-song' }));

  const updated = await updateSharedSong(kv, 'external-1', {
    songId: 'new-song',
    songTxt: '#TITLE:New Song\nE',
    artist: 'New Artist',
    title: 'New Song',
    language: ['Polish'],
    videoId: 'newVideoId',
  });

  expect(updated).toBe(true);
  expect(await getSharedSong(kv, 'external-1')).toMatchObject({
    externalSongId: 'external-1',
    songId: 'new-song',
    title: 'New Song',
  });
  expect(await getSharedSong(kv, 'new-song')).toBeNull();
  expect(await listSharedSongs(kv)).toEqual([
    expect.objectContaining({
      externalSongId: 'external-1',
      songId: 'new-song',
      title: 'New Song',
    }),
  ]);
});
```

**Step 2: Run the failing tests**

Run:

```bash
pnpm test functions/shared-songs-store.test.ts
```

Expected: fail because `updateSharedSong` does not exist and `SharedSongIndexEntry` does not expose `externalSongId`.

**Step 3: Implement the store changes**

In `functions/shared-songs-store.ts`, change the index type:

```ts
export type SharedSongIndexEntry = Pick<
  SharedSongRecord,
  'externalSongId' | 'songId' | 'artist' | 'title' | 'language' | 'videoId'
>;
```

Update index helpers so they match by `externalSongId`, not `songId`:

```ts
const addToIndex = async (kvNamespace: KVNamespace, entry: SharedSongIndexEntry) => {
  const index = await getIndex(kvNamespace);
  const nextIndex = [...index.filter((song) => song.externalSongId !== entry.externalSongId), entry];
  await kvNamespace.put(INDEX_KEY, JSON.stringify(nextIndex));
};

const removeFromIndex = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const index = await getIndex(kvNamespace);
  await kvNamespace.put(INDEX_KEY, JSON.stringify(index.filter((song) => song.externalSongId !== externalSongId)));
};
```

When creating index entries in `upsertSharedSong` and `regenerateIndex`, include `externalSongId`.

Add the update helper:

```ts
export type SharedSongUpdate = Pick<
  SharedSongRecord,
  'songId' | 'songTxt' | 'artist' | 'title' | 'language' | 'videoId'
>;

export const updateSharedSong = async (
  kvNamespace: KVNamespace,
  externalSongId: string,
  update: SharedSongUpdate,
) => {
  const currentRecord = await getSharedSong(kvNamespace, externalSongId);

  if (!currentRecord) {
    return false;
  }

  const updatedRecord: SharedSongRecord = {
    ...currentRecord,
    ...update,
    externalSongId,
    lastSeenAt: Date.now(),
  };

  await kvNamespace.put(getStorageKey(externalSongId), JSON.stringify(updatedRecord));
  await addToIndex(kvNamespace, {
    externalSongId,
    songId: updatedRecord.songId,
    artist: updatedRecord.artist,
    title: updatedRecord.title,
    language: updatedRecord.language,
    videoId: updatedRecord.videoId,
  });

  return true;
};
```

Handle old deployed indexes defensively. If `listSharedSongs` reads an older entry without `externalSongId`, normalize it with `externalSongId: song.songId`.

**Step 4: Update the public search endpoint**

In `functions/shared-songs.ts`, return the real external id:

```ts
.map((song) => ({
  externalSongId: song.externalSongId,
  songId: song.songId,
  artist: song.artist,
  title: song.title,
  language: song.language,
  videoId: song.videoId,
}));
```

If using a compatibility type for old index entries, keep the fallback in the store so this endpoint stays simple.

**Step 5: Run tests**

Run:

```bash
pnpm test functions/shared-songs-store.test.ts
```

Expected: pass.

**Step 6: Commit**

```bash
git add functions/shared-songs-store.ts functions/shared-songs-store.test.ts functions/shared-songs.ts
git commit -m "Support stable shared song external ids"
```

## Task 2: Add Browser Admin Cloudflare Functions

**Files:**

- Create: `functions/shared-songs-browser-admin-auth.ts`
- Create: `functions/admin/shared-songs.ts`
- Create: `functions/admin/shared-song.ts`
- Create: `functions/admin/shared-songs.test.ts`
- Create: `functions/admin/shared-song.test.ts`

**Step 1: Write failing admin function tests**

Create tests with a small `MockKVNamespace` similar to `functions/shared-songs-store.test.ts`.

Cover:

- missing/wrong password returns `401`
- `GET /admin/shared-songs` returns list data
- `DELETE /admin/shared-songs?id=<externalSongId>` deletes and returns `{ ok: true }`
- `PUT /admin/shared-songs` regenerates the index
- `PUT /admin/shared-song?id=<externalSongId>` updates an existing record
- updating a missing record returns `404`

Use a test env:

```ts
const env = {
  SHARED_SONGS_ADMIN_PASSWORD: 'admin-password',
  SHARED_SONGS_KV: kv,
};
```

Use requests like:

```ts
new Request('https://example.com/admin/shared-songs', {
  headers: { 'x-shared-songs-admin-password': 'admin-password' },
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test functions/admin/shared-songs.test.ts functions/admin/shared-song.test.ts
```

Expected: fail because the functions do not exist.

**Step 3: Add shared password auth helper**

Create `functions/shared-songs-browser-admin-auth.ts`:

```ts
interface AdminPasswordEnv {
  SHARED_SONGS_ADMIN_PASSWORD?: string;
}

export const responseHeaders = {
  'Content-Type': 'application/json',
};

export const isAuthorizedSharedSongsAdmin = (request: Request, env: AdminPasswordEnv) => {
  const expectedPassword = env.SHARED_SONGS_ADMIN_PASSWORD;
  const password = request.headers.get('x-shared-songs-admin-password');

  return !!expectedPassword && password === expectedPassword;
};

export const unauthorizedResponse = () =>
  new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: responseHeaders,
  });
```

**Step 4: Implement `functions/admin/shared-songs.ts`**

Support:

- `GET`: list index entries
- `DELETE`: remove by query `id`
- `PUT`: regenerate index

Use `listSharedSongs`, `removeSharedSong`, and `regenerateIndex`.

Return `500` if `SHARED_SONGS_KV` is missing. Return `400` for missing `id` on delete. Return `404` when delete target is missing.

**Step 5: Implement `functions/admin/shared-song.ts`**

Support:

- `PUT`: update existing record by query `id`

Validate the JSON body shape:

```ts
{
  songId: string;
  songTxt: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
}
```

Call `updateSharedSong`. Return `404` if the record does not exist.

**Step 6: Run admin function tests**

Run:

```bash
pnpm test functions/admin/shared-songs.test.ts functions/admin/shared-song.test.ts
```

Expected: pass.

**Step 7: Commit**

```bash
git add functions/shared-songs-browser-admin-auth.ts functions/admin/shared-songs.ts functions/admin/shared-song.ts functions/admin/shared-songs.test.ts functions/admin/shared-song.test.ts
git commit -m "Add browser shared songs admin API"
```

## Task 3: Add Frontend Admin Route and API Client

**Files:**

- Create: `src/routes/admin/admin-password.ts`
- Create: `src/routes/admin/shared-songs-admin-api.ts`
- Create: `src/routes/admin/admin.tsx`
- Modify: `src/routes/route-paths.ts`
- Modify: `src/app.tsx`

**Step 1: Add password storage helper**

Create `src/routes/admin/admin-password.ts`:

```ts
export const ADMIN_PASSWORD_STORAGE_KEY = 'shared-songs-admin-password';

export const getAdminPassword = () =>
  typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) ?? '';

export const setAdminPassword = (password: string) => {
  sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
};

export const clearAdminPassword = () => {
  sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
};
```

**Step 2: Add admin API client**

Create `src/routes/admin/shared-songs-admin-api.ts`.

Export:

- `listAdminSharedSongs(password: string)`
- `deleteAdminSharedSong(password: string, externalSongId: string)`
- `regenerateAdminSharedSongsIndex(password: string)`
- `updateAdminSharedSong(externalSongId: string, song: Song)`

`updateAdminSharedSong` should read the password via `getAdminPassword`, convert the song with `convertSongToTxt`, and send:

```ts
{
  songId: song.id,
  songTxt: convertSongToTxt(song),
  artist: song.artist,
  title: song.title,
  language: song.language,
  videoId: song.video,
}
```

Use the header:

```ts
'x-shared-songs-admin-password': password
```

Throw an error for non-2xx responses so callers can distinguish unauthorized and failed mutations.

**Step 3: Add `/admin` route path**

In `src/routes/route-paths.ts`, add:

```ts
ADMIN: 'admin',
```

In `src/app.tsx`, lazy load the admin page and add a hidden route:

```tsx
const LazyAdmin = lazy(() => import('~/routes/admin/admin'));
```

```tsx
<Route
  path={routePaths.ADMIN}
  component={() => (
    <Suspense fallback={<PageLoader />}>
      <LazyAdmin />
    </Suspense>
  )}
/>
```

Do not link it from `ManageSongs` or the main menu.

**Step 4: Build the admin page**

Create `src/routes/admin/admin.tsx`.

Use:

- `useBackground(false)`
- `useBackgroundMusic(false)`
- `NoPrerender`
- `Helmet`
- Material UI `Button`, `TextField`, `IconButton`, `Alert`
- `MaterialReactTable`
- icons from `@mui/icons-material`, for example `Edit`, `Delete`, `Refresh`, `Logout`, `Sync`

State:

- `password`
- `songs`
- `isLoading`
- `error`
- `isAuthenticated`

On initial mount, read `getAdminPassword()` and call list if present.

Table behavior:

- client-side sorting and filtering enabled
- `initialState` includes compact density and visible global filter
- default columns: artist, title, language, videoId, songId, externalSongId
- row actions: edit and delete

Edit link:

```tsx
<Link to={`edit/song/?externalSong=${encodeURIComponent(row.original.externalSongId)}&admin=true`}>
```

Delete flow:

```ts
if (!global.confirm('Remove this shared song from Cloudflare KV?')) return;
await deleteAdminSharedSong(password, row.original.externalSongId);
await loadSongs(password);
```

Logout:

```ts
clearAdminPassword();
navigate('admin/');
```

**Step 5: Run type-check**

Run:

```bash
pnpm type-check
```

Expected: pass or reveal type issues in the new route/API client.

**Step 6: Commit**

```bash
git add src/routes/admin src/routes/route-paths.ts src/app.tsx
git commit -m "Add shared songs admin page"
```

## Task 4: Wire Admin Edit Save Back to KV

**Files:**

- Modify: `src/routes/edit/edit.tsx`
- Modify: `src/routes/convert/convert-view.tsx`
- Modify if needed: `src/routes/admin/shared-songs-admin-api.ts`

**Step 1: Add admin edit props**

In `src/routes/convert/convert-view.tsx`, extend props:

```ts
interface Props {
  song?: Song;
  adminSharedSongExternalId?: string;
}
```

In `src/routes/edit/edit.tsx`, detect admin context:

```ts
const isAdminEdit = useQueryParam('admin') === 'true';
```

Pass it to `LazyConvert` only when both admin mode and `externalSongId` are present:

```tsx
<LazyConvert
  song={song.data}
  adminSharedSongExternalId={isAdminEdit && externalSongId ? externalSongId : undefined}
/>
```

**Step 2: Change save flow for admin shared-song edits**

In `ConvertView`, branch inside `saveSong`.

Expected behavior:

```ts
await SongDao.store(finalSong!);
await shareSong(finalSong!.id);

if (adminSharedSongExternalId) {
  await updateAdminSharedSong(adminSharedSongExternalId, finalSong!);
  navigate('admin/');
  return;
}
```

Keep existing `redirect` and normal edit/list behavior for non-admin saves.

If `updateAdminSharedSong` throws, keep the user on the editor and show an error near the fixed bottom action bar. Do not redirect.

**Step 3: Add save error UI**

Add `saveError` state:

```ts
const [saveError, setSaveError] = useState<string | null>(null);
```

Clear it before save attempts and render an `Alert` above the fixed footer when present:

```tsx
{saveError && <Alert severity="error">{saveError}</Alert>}
```

**Step 4: Run type-check**

Run:

```bash
pnpm type-check
```

Expected: pass.

**Step 5: Commit**

```bash
git add src/routes/edit/edit.tsx src/routes/convert/convert-view.tsx src/routes/admin/shared-songs-admin-api.ts
git commit -m "Update KV from admin song edits"
```

## Task 5: Add Focused Frontend E2E Coverage

**Required skills while implementing this task:** @e2e-playwright and @writing-e2e-tests.

**Files:**

- Create: `tests/admin-shared-songs.spec.ts`
- Modify if useful: `tests/page-objects/initialise.ts`
- Modify if useful: `tests/page-objects/song-edit-basic-info-page.ts`

**Step 1: Test password storage, list, and logout**

Mock:

- `GET **/admin/shared-songs`

Test flow:

1. `page.goto('/admin?e2e-test')`
2. Fill password.
3. Submit.
4. Assert the table shows the mocked shared song.
5. Click logout.
6. Assert the password field is visible again.
7. Assert `sessionStorage` no longer has `shared-songs-admin-password`.

**Step 2: Test delete refetches**

Mock:

- first `GET /admin/shared-songs` returns one song
- `DELETE /admin/shared-songs?id=external-1` returns `{ ok: true }`
- second `GET /admin/shared-songs` returns `[]`

Test:

1. Login.
2. Click delete.
3. Accept confirm dialog.
4. Assert row disappears.

**Step 3: Test admin edit save updates KV and returns to `/admin`**

Mock:

- `GET /shared-song?id=external-1` returns a full shared-song payload with `songTxt`
- `PUT /admin/shared-song?id=external-1` captures the JSON body and returns `{ ok: true }`
- `GET /admin/shared-songs` returns the edited row after redirect

Set session storage before navigation:

```ts
await page.addInitScript(() => {
  sessionStorage.setItem('shared-songs-admin-password', 'admin-password');
});
```

Navigate directly:

```ts
await page.goto('/edit/song/?externalSong=external-1&admin=true&step=metadata&e2e-test');
```

Click save and assert:

- request body keeps update target `external-1` in the URL
- body contains `songTxt`, `songId`, `artist`, `title`, `language`, `videoId`
- final URL is `/admin`

**Step 4: Run the focused E2E**

Run:

```bash
pnpm playwright test tests/admin-shared-songs.spec.ts
```

Expected: pass.

**Step 5: Commit**

```bash
git add tests/admin-shared-songs.spec.ts tests/page-objects
git commit -m "Test shared songs admin workflow"
```

## Task 6: Update Documentation and Run Final Verification

**Files:**

- Modify: `docs/shared-songs-flow.md`
- Modify if needed: `wrangler.jsonc`

**Step 1: Update shared songs docs**

In `docs/shared-songs-flow.md`, add:

- browser admin route: `/admin`
- admin API endpoints under `/admin/*`
- `SHARED_SONGS_ADMIN_PASSWORD`
- password is sent as `x-shared-songs-admin-password`
- frontend stores it in `sessionStorage`
- admin edit keeps `externalSongId` stable while updating KV content

**Step 2: Check Cloudflare env config**

Inspect `wrangler.jsonc`. If this project documents vars there, add a non-secret placeholder only if appropriate. Do not commit a real password.

**Step 3: Run focused tests**

Run:

```bash
pnpm test functions/shared-songs-store.test.ts functions/admin/shared-songs.test.ts functions/admin/shared-song.test.ts
pnpm playwright test tests/admin-shared-songs.spec.ts
pnpm type-check
```

Expected: all pass.

**Step 4: Commit docs/config**

```bash
git add docs/shared-songs-flow.md wrangler.jsonc
git commit -m "Document shared songs admin panel"
```

## Task 7: Manual Smoke Test

**Files:**

- No expected file changes.

**Step 1: Start the app**

Run:

```bash
pnpm dev
```

Expected: Vite/Cloudflare dev server starts.

**Step 2: Open admin panel**

Open:

```text
https://localhost:3000/admin
```

Check:

- password prompt appears
- wrong password shows unauthorized state
- correct password lists shared songs when KV/env are configured
- table filtering and sorting work
- logout clears session password and returns to password prompt

**Step 3: Smoke mutations in local/dev KV**

With local KV configured:

- regenerate index
- delete a fixture song
- re-upsert fixture if needed with `pnpm shared-song:upsert-fixture`
- edit a fixture song and confirm it returns to `/admin`
- search for the edited shared song in the normal song-selection shared fallback

**Step 4: Final status**

Run:

```bash
git status --short
```

Expected: clean worktree.
