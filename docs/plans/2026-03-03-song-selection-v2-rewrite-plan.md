# Song Selection V2 Rewrite — Implementation Plan

**Design doc:** [2026-03-03-song-selection-v2-rewrite-design.md](./2026-03-03-song-selection-v2-rewrite-design.md)  
**Date:** 2026-03-03

---

## Guiding Rules

- No imports from `SingASong/SongSelection/` (V1) — not components, not hooks, not utils
- No `@emotion/styled` — Tailwind CSS 4 + `react-twc` only
- No `useMediaQuery` from MUI — use native matchMedia or Tailwind responsive classes
- Every step below is independently mergeable and testable

---

## Step 1 — Copy & detach hooks

Copy all V1 hook files that V2 currently re-imports into `SongSelectionV2/Hooks/`. The hooks folder is already a copy, but verify there are no remaining imports pointing at `SongSelection/Hooks/`.

**Files to audit for cross-imports:**
- `SongSelectionV2/Hooks/useSongSelection.ts`
- `SongSelectionV2/Hooks/usePlaylists.tsx`
- `SongSelectionV2/Hooks/useSongList.ts`
- `SongSelectionV2/Hooks/useSongListFilter.ts`
- `SongSelectionV2/Hooks/useSongSelectionKeyboardNavigation.ts`
- `SongSelectionV2/Hooks/useSpecialTheme.ts`
- `SongSelectionV2/Hooks/useRecommendedSongs.ts`
- `SongSelectionV2/Hooks/selectRandomSong.ts`
- `SongSelectionV2/Hooks/usePlaylistsEurovision.tsx`

Fix any imports pointing to `SingASong/SongSelection/Hooks/` to point at the V2 local copy instead.

> ✅ Done when: zero imports from `SongSelection/Hooks/` anywhere under `SongSelectionV2/`

---

## Step 2 — Rewrite `SongCard.tsx`

New clean poster-style card. No Emotion. No dependency on V1.

**Props:**
```ts
interface SongCardProps {
  song: SongPreview;
  focused?: boolean;
  songId?: string;
  groupLetter?: string;
  handleClick?: (songId: string, groupLetter?: string) => void;
  isPopular: boolean;
  forceFlag: boolean;
  video?: ReactNode;          // slot for video overlay (used by SongPreview)
  className?: string;
  [data: `data-${string}`]: unknown;
}
```

**Structure:**
```
<div>  ← card root, 16:9, relative, overflow-hidden, focus outline via data-focused
  <img />            ← YouTube thumbnail (hqdefault.jpg), absolute inset, object-cover
  <video slot />     ← optional, absolute inset, rendered over thumbnail
  <div>              ← bottom scrim (gradient), absolute bottom
    <span>Artist</span>
    <span>Title</span>
  </div>
  <div>              ← top-right badges: New | star | flag
    <SongFlag />
    {isPopular && <StarBadge />}
  </div>
</div>
```

**No** `SongCardBackground` animated component. **No** `SongInfo` styled wrapper. **No** `ExpandedData`.

Replace badge sub-components (`SongFlag`, `TopContainer`) with minimal inline implementations or local helper components.

> ✅ Done when: `SongCard.tsx` has zero Emotion imports and zero imports from V1

---

## Step 3 — Rewrite `SongPreview.tsx`

Decoupled overlay. No dependency on `SongCard`. No Emotion.

**Props:** same as current (`songPreview`, `top`, `left`, `width`, `height`, `keyboardControl`, `onPlay`, `onExitKeyboardControl`, `isPopular`, `forceFlag`)

**Structure:**
- Absolutely positioned container sized + offset via inline style from props
- Renders the expanded card face directly (thumbnail + text) — does NOT render `<SongCard>`
- Contains `VideoPlayer` for preview playback (debounced, same logic as current)
- Renders `<SongSettings>` when `keyboardControl` (expanded)
- All transition/animation via Tailwind CSS transitions

> ✅ Done when: `SongPreview.tsx` has zero Emotion imports, zero imports from `SongSelection/Components/SongCard`

---

## Step 4 — Rewrite `SongSettings/` subtree

Rewrite the `SongSettings/` folder files (the innermost, deepest components first):

1. `SongSettings/MicCheck/NoiseDetection.tsx`
2. `SongSettings/MicCheck/Status.tsx`
3. `SongSettings/MicCheck/MicCheck.tsx`
4. `SongSettings/PlayerSettings/SinglePlayer.tsx`
5. `SongSettings/PlayerSettings/PlayerSettings.tsx`
6. `SongSettings/GameSettings.tsx`
7. `SongSettings/SongSettings.tsx`

For each file: remove `@emotion/styled`, replace with Tailwind classes. Keep all logic unchanged.

> ✅ Done when: zero Emotion imports in `SongSettings/`

---

## Step 5 — Rewrite `BackgroundThumbnail.tsx`

Simple rewrite: a `<img>` (or `<div>` with background-image) with Tailwind classes:
`fixed inset-0 w-full h-full object-cover blur-md grayscale opacity-25`

> ✅ One file, trivial

---

## Step 6 — Rewrite `VirtualizedList.tsx` + `CustomVirtualization.tsx`

Port the existing virtualization logic (row rendering, scroll-to, group tracking) to a new file with no Emotion. The row/group wrapper components (`ListRow`, `GroupRow`) become Tailwind-styled via `twc()` or plain `className`.

Keep the `VirtualizedListMethods` interface and `scrollToSongInGroup`/`getSongPosition`/`scrollToGroup` API unchanged — `SongSelection.tsx` depends on it.

> ✅ Done when: zero Emotion imports in both files

---

## Step 7 — New `Toolbar.tsx`

New component — does not exist in V1.

**Props:**
```ts
interface ToolbarProps {
  filters: AppliedFilters;
  setFilters: Dispatch<SetStateAction<AppliedFilters>>;
  onRandom: () => void;
  playlists: PlaylistEntry[];
  selectedPlaylist: string | null;
  setSelectedPlaylist: (name: string) => void;
  keyboardControl: boolean;
}
```

**Desktop layout** (single bar):
- Left: search input (always visible) + random button
- Right: playlist buttons (one per playlist, active state highlighted)

**Mobile layout:**
- Search collapses to a search icon; tap → expands full-width input overlay
- Playlist selector → native `<select>` (detected via `isMobile()` + orientation)

Absorbs the responsibilities of the old `AdditionalListControls.tsx` + `Playlists.tsx` + `QuickSearch.tsx`.

> ✅ Done when: Toolbar renders correctly on desktop and mobile

---

## Step 8 — Rewrite `SongGroupsNavigation.tsx`

Same scroll-spy logic (IntersectionObserver + MutationObserver). Remove Emotion. Remove MUI. Tailwind only.

Layout: horizontally scrollable row, no wrapping. Each group = a button. Active group highlighted.

> ✅ Done when: zero Emotion/MUI imports

---

## Step 9 — Rewrite `SongSelection.tsx` (main screen)

Wire everything together with the new layout. Remove Emotion, MUI `useMediaQuery`.

**Layout structure:**
```tsx
<LayoutGame>
  <div className="flex flex-col h-screen">
    <Toolbar ... />                   {/* fixed height */}
    <SongGroupsNavigation ... />      {/* fixed height */}
    <div className="flex-1 overflow-hidden relative">
      {songPreview && <BackgroundThumbnail videoId={songPreview.video} />}
      {/* loading skeleton */}
      {/* VirtualizedList */}
      {/* SongPreview overlay */}
    </div>
  </div>
</LayoutGame>
```

CSS custom properties for card dimensions stay on the container (keep the pattern, it's clean).

Replace `useMediaQuery` from MUI with a local `useMediaQuery` hook (native `window.matchMedia`).

Remove old styled components: `Container`, `SongListContainer`, `SongImageBackground`, `SongListEntry`, `ListRow`, `GroupRow`, `SongsGroupHeader`, `SongsGroupContainer`, `SongListEntrySkeleton`, `AddSongs`, etc.

> ✅ Done when: main file has zero Emotion imports, zero imports from `SongSelection/`

---

## Step 10 — Delete dead files

After step 9, the following V2 files become unused and should be deleted:
- `AdditionalListControls.tsx` (replaced by `Toolbar.tsx`)
- `Playlists.tsx` (absorbed into `Toolbar.tsx`)
- `QuickSearch.tsx` (absorbed into `Toolbar.tsx`)

> ✅ Done when: no dead files, no broken imports

---

## Step 11 — Verify no V1 cross-imports remain

```bash
grep -r "SongSelection/" src/routes/SingASong/SongSelectionV2/
```

Must return zero results.

---

## Step 12 — Run tests

```bash
pnpm test                  # unit tests
pnpm e2e --project="chromium" tests/sing-a-song.spec.ts
```

Fix any failures.

---

## Execution Order Summary

| Step | File(s) | Effort |
|------|---------|--------|
| 1 | Detach hooks | Small |
| 2 | SongCard | Medium |
| 3 | SongPreview | Medium |
| 4 | SongSettings/ subtree | Medium |
| 5 | BackgroundThumbnail | Tiny |
| 6 | VirtualizedList | Medium |
| 7 | Toolbar (new) | Medium |
| 8 | SongGroupsNavigation | Small |
| 9 | SongSelection (main) | Large |
| 10 | Delete dead files | Tiny |
| 11 | Audit cross-imports | Tiny |
| 12 | Tests | Variable |

Steps 2–6 can be done in parallel (no dependencies between them). Steps 7–8 can also be done before step 9.
