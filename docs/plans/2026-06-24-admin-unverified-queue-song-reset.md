# Admin Unverified Queue Song Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent admin unverified queue edits from leaking sync-step state from one song into the next while preserving the just-saved song updates.

**Architecture:** Reset stale song data as soon as the queue target changes so the editor does not mount the next queue item with the previous song payload. Add explicit reset points for sync-step local state that is intentionally preserved within a song but must be cleared when the loaded song changes.

**Tech Stack:** React, TypeScript, Playwright

---

### Task 1: Reset loaded song data between queue items

**Files:**

- Modify: `src/modules/songs/hooks/use-song.ts`

**Step 1: Clear the current `song` state before starting a new load**

**Step 2: Keep the existing async load branches for library and unverified songs**

**Step 3: Verify the editor falls back to loading instead of reusing the previous queue item**

### Task 2: Reset sync-step local state when the source song changes

**Files:**

- Modify: `src/routes/convert/steps/sync-lyrics-to-video.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video/components/edit-section.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video/components/manipulate-bpm.tsx`

**Step 1: Key the sync editor by the loaded song identity**

**Step 2: Reset BPM, gap shifts, track names, lyric edits, and section edits when `song` changes**

**Step 3: Reset helper UI state such as selected section and desired last-note end time**

### Task 3: Add a queue regression test

**Files:**

- Modify: `tests/page-objects/song-edit-sync-lyrics-to-video-page.ts`
- Modify: `tests/admin-unverified-songs.spec.ts`

**Step 1: Seed two queue songs with different sync metadata where needed**

**Step 2: Edit multiple sync-step fields on the first queue item, save, and advance**

**Step 3: Assert the next queue item shows its own BPM and blank/default sync fields while the saved song update persists**
