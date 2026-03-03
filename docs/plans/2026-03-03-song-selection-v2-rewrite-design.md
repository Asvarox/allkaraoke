# Song Selection V2 Rewrite — Design Document

**Date:** 2026-03-03  
**Status:** Approved  

## Overview

Rewrite `SongSelectionV2` — the A/B test variant of the song selection screen — with two goals:

1. **Technical:** Remove all Emotion (`@emotion/styled`) usage; migrate to Tailwind CSS 4 + `react-twc`. Remove MUI dependency from this screen.
2. **UI:** Modernise the layout with a fixed toolbar (search + playlists), fixed group navigation row, and a simplified song grid.

`SongSelectionV1` (`src/routes/SingASong/SongSelection/`) is **not touched**.

---

## Approach

**Full V2 rewrite — no shared UI components with V1.**

- All UI components under `SongSelectionV2/Components/` are new files, importing nothing from `SongSelection/Components/`
- All hooks under `SongSelectionV2/Hooks/` are already self-contained copies — they stay that way and can be freely refactored without risk to V1
- Shared non-UI code (interfaces, game engine, events, song data) continues to be imported from `~/modules/` as normal

---

## File Structure

```
SongSelectionV2/
  SongSelection.tsx              ← main screen (rewritten)
  Components/
    Toolbar.tsx                  ← search bar + playlist selector (new)
    SongGroupsNavigation.tsx     ← fixed horizontal group tab row (rewritten)
    SongCard.tsx                 ← dumb poster-style card (simplified, new)
    SongPreview.tsx              ← expanded overlay (rewritten, decoupled from SongCard)
    BackgroundThumbnail.tsx      ← blurred bg image (rewritten)
    VirtualizedList.tsx          ← virtualized grid (rewritten)
    SongSettings/
      SongSettings.tsx
      GameSettings.tsx
      PlayerSettings/
      MicCheck/
  Hooks/                         ← already self-contained, no changes to structure
  utils/
```

---

## Layout

### Desktop
```
┌─────────────────────────────────────────────────┐
│  [Search ___________________]  [Playlists tabs]  │  ← fixed toolbar
├─────────────────────────────────────────────────┤
│  [A]  [B]  [C]  [New]  [All]  …                 │  ← fixed group nav (h-scroll)
├─────────────────────────────────────────────────┤
│                                                  │
│  [card][card][card]                              │  ← scrollable song grid
│  [card][card][card]                              │    3 columns desktop
│  ...                                             │
└─────────────────────────────────────────────────┘
```

- Toolbar and group navigation are **fixed** (do not scroll)
- Only the song grid scrolls
- No left sidebar — playlists and group navigation are in the top bars

### Mobile
- **Portrait:** 1 column grid
- **Landscape:** 2 columns grid
- Search bar collapses to a search icon; tapping expands a full-width input overlay
- Playlist selector becomes a native `<select>` dropdown
- Group navigation: same horizontal scroll row, smaller text

### Background
Blurred YouTube thumbnail of the currently focused song, `position: fixed`, low opacity — same behaviour as current.

---

## Song Card (`SongCard.tsx`)

**Dumb display component** — no knowledge of expansion, video, or game settings.

- 16:9 aspect ratio
- YouTube thumbnail fills the card
- Semi-transparent scrim at the bottom with artist + title text
- Small badge overlays (top-right): "New", popularity star, country flag
- Focused state: border/outline highlight only (no scale transform, no glow animation)
- Extensible: accepts an optional `video` slot prop for the expanded overlay use case
- Implemented as a plain functional component with Tailwind classes; `twc()` used only if variants are needed

---

## Song Preview (`SongPreview.tsx`)

**Separate overlay component**, rendered at the list level (not inside `SongCard`).

- Positioned absolutely over the focused card using `top`/`left`/`width`/`height` coords supplied by the parent
- Owns video playback, enter/exit transitions, and `SongSettings`
- No dependency on `SongCard`
- `SongSettings` is a sub-component rendered only when preview is in expanded (keyboard control) mode

**Data flow:**
```
SongSelection
  ├── VirtualizedList
  │     └── SongCard  (dumb — focused = outline only)
  └── SongPreview  (overlay — owns video + settings)
```

---

## Styling Rules

| Old | New |
|-----|-----|
| `@emotion/styled` | Tailwind CSS 4 utility classes |
| `styled(Component)\`...\`` with variants | `twc(Component)\`...\`` |
| `cssMixins` (`typography`, `mobileMQ`, `focused`) | Tailwind utilities / `twc` variants |
| `useMediaQuery` from MUI | Native `matchMedia` hook or Tailwind responsive classes |
| CSS-in-JS dynamic props | CSS custom properties (already used for card dimensions — keep this pattern) |

- `isMobile` library: kept as-is
- CSS variables for layout dimensions (`--song-entry-width`, `--song-entry-height`, `--song-list-gap`, etc.) set on the container and consumed in children — keep this pattern

---

## Out of Scope

- No changes to `SongSelectionV1`
- No changes to hooks structure
- No new game features or logic changes
- Animations / transitions on cards ("add it later")
