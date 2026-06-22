# Song Editor Sync BPM Shortcuts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add quick actions in the song editor sync step to copy the current player time into the target-last-note field and immediately apply the estimated BPM.

**Architecture:** Keep `desiredLastNoteEnd` local to `ManipulateBpm`, but pass a parent callback from `edit-song.tsx` so the component can read the current player time on demand. Keep BPM application on the existing `overrideBpm` path by making the estimated BPM text invoke the current `onChange` prop directly.

**Tech Stack:** React, TypeScript, MUI TextField/Button, Playwright page objects

---

### Task 1: Wire the new sync-step actions

**Files:**

- Modify: `src/routes/convert/steps/sync-lyrics-to-video/components/manipulate-bpm.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx`

**Step 1: Add a parent callback prop**

Extend `ManipulateBpm` with an async callback prop that returns the current player time in milliseconds.

**Step 2: Add the target-last-note adornment**

Render a small end-adornment button inside the target-last-note text field. On click, read the current player time, round it, and write it into the local `desiredLastNoteEnd` state.

**Step 3: Make the estimated BPM clickable**

Compute the estimated BPM once per render and display it as a text-styled button in helper text. On click, immediately call the existing BPM `onChange` prop with that value.

### Task 2: Extend focused Playwright coverage

**Files:**

- Modify: `tests/page-objects/song-edit-sync-lyrics-to-video-page.ts`
- Modify: `tests/convert-song.spec.ts`

**Step 1: Add page-object helpers**

Add locators and actions for the current-time adornment, the current playback time text, and the clickable estimated BPM value.

**Step 2: Verify both interactions**

Update the sync-step Playwright flow to:

- seek to a stable playback time
- copy that time into the target-last-note field
- confirm the estimated BPM appears
- click the estimate and confirm the BPM field updates immediately

### Task 3: Verify the change

**Files:**

- No additional file changes required unless follow-up fixes are needed

**Step 1: Run a focused type check**

Run: `pnpm type-check`

Expected: no new TypeScript errors from the sync-step changes.

**Step 2: Run focused Playwright coverage if practical**

Run: `pnpm playwright test tests/convert-song.spec.ts`

Expected: the sync-step interactions still pass with the new quick actions.
