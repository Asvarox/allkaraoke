# Singing History Page — Design

**Date:** 2026-05-19  
**Status:** Approved

## Overview

A new page accessible from the main menu that shows a chronological, date-grouped feed of all songs sung on this device. Each entry is minimal by default and expandable to show full detail.

## Requirements

- Show all song plays from this device (global — not per-player)
- Primary use case: browsing recent history ("what did we sing last Friday?")
- Minimal card by default, expandable to full detail
- Accessible from the main menu
- Keyboard navigable (same pattern as other screens)

## Data Flow

Play history is already stored in LocalForage (IndexedDB) per song. No storage schema changes are needed.

### Data pipeline — `usePlayHistory()` hook

1. Load all stats: `getAllStats()` → `Record<songHash, SongStats>`
2. Load song index: `SongsService.getIndex()` → `SongPreview[]`
3. Build lookup map: `hash → SongPreview` by computing `getSongKey(song)` for each song
4. Flatten all score entries from all songs into a single array, attaching the matched `SongPreview`
5. Sort by `date` descending
6. Group by calendar day

If a song has since been removed from the library, the entry still appears with a `null` song reference and renders a "Deleted song" fallback label — history is never silently dropped.

### `PlayHistoryEntry` type

```typescript
interface PlayHistoryEntry {
  songKey: string;
  song: SongPreview | null;       // null = song removed from library
  date: string;                   // ISO timestamp
  progress: number | undefined;   // 0–1 completion
  mode: GAME_MODE;
  scores: Array<{ name: string; score: number }>;
}
```

## Page Structure

```
HistoryPage  (src/routes/History/HistoryPage.tsx)
├── Page header — "History" title + back button to menu
├── Empty state — "No songs sung yet — go sing something!" (when no entries)
└── Per calendar day:
    ├── DateHeader — "Today" / "Yesterday" / "18 May 2026"
    └── PlayEntryCard × N
        ├── [collapsed]  Song title · Artist · time (e.g. "9:32 PM")
        └── [expanded]   + Game mode · Player name(s) with scores · completion %
```

### Co-op vs. duel score display

- **Co-op mode**: scores are stored as a single combined entry (e.g. `"Alex, Sam — 1,240,000"`). Displayed as one row.
- **Duet / duel mode**: each player's score is listed as a separate row.

This matches the existing storage format — no transformation needed.

## Components

All in `src/routes/History/`:

| File | Responsibility |
|------|---------------|
| `HistoryPage.tsx` | Main page, calls `usePlayHistory()`, renders date groups |
| `PlayEntryCard.tsx` | Single expandable card; click/Enter toggles expanded state |
| `usePlayHistory.ts` | Data hook — flatten, sort, group by day |

Styling uses existing AKUI components (Tailwind, consistent with the rest of the app).

## Navigation & Keyboard Support

- New route: `HISTORY: 'history'` added to `routePaths.ts` and registered in `App.tsx`
- "History" button added to the main menu

### Keyboard navigation

Uses the standard `useKeyboardNav` pattern:

- `direction: 'vertical'` — ↑/↓ moves between `PlayEntryCard` entries
- **Enter** — expands or collapses the focused card
- **Backspace / Escape** — goes back to the menu
- Date headers are **not** focusable — only song play entries are registered
- Built-in auto-scroll, sound effects (menuNavigate, menuEnter, menuBack), and keyboard help overlay all work automatically

## File Locations

```
src/
  routes/
    History/
      HistoryPage.tsx
      PlayEntryCard.tsx
      usePlayHistory.ts
  routes/routePaths.ts        ← add HISTORY route
  App.tsx                     ← register route
  routes/Menu/                ← add History button
```

## Out of Scope

- Per-player filtering
- Session grouping (multiple songs played in one sitting shown as one "session")
- Deleting individual history entries
- Exporting history
