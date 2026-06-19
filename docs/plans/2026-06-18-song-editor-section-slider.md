# Song Editor Section Slider Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a compact section slider below the song editor section navigation buttons that tracks the current notes section and seeks only after the thumb is released.

**Architecture:** Extend the existing song editor control block in `edit-song.tsx` by deriving the notes-section list once, sharing a single `seekToSection` helper across navigation actions, and layering a controlled MUI slider on top of the current playback section index. Keep drag state local so playback updates cannot fight the thumb during user interaction.

**Tech Stack:** React, TypeScript, MUI Slider, existing player/section helpers

---

### Task 1: Refactor section navigation helpers

**Files:**

- Modify: `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx`

**Step 1: Add a shared notes-section collection**

Create a memoized `notesSections` array from `newSong.tracks[0].sections.filter(isNotesSection)` near the existing playback helpers so all navigation logic uses one source.

**Step 2: Add a `seekToSection` helper**

Implement `seekToSection(sectionIndex: number, padding?: seconds)` that clamps the index, pulls the first note from the chosen notes section, and delegates to `seekToNote`.

**Step 3: Reuse the helper from button navigation**

Update first/previous/next/last navigation helpers to use `notesSections` and `seekToSection` so the new slider and the existing buttons share the same targeting logic.

### Task 2: Add the slider UI and interaction state

**Files:**

- Modify: `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx`

**Step 1: Track live and temporary slider values**

Use `useCurrentSectionIndex(notesSections, player.current, beatLength, newSong.gap)` when the player exists, plus local `sectionSliderValue` and `isDraggingSectionSlider` state.

**Step 2: Keep the thumb synced while idle**

Add an effect that copies the live current section index into the controlled slider state whenever the user is not dragging.

**Step 3: Render the slider below the buttons**

Import MUI `Slider` and render a compact slider only when there are notes sections, with:

- `min=0`
- `max=notesSections.length - 1`
- `step=1`
- controlled `value`
- `size="small"`

**Step 4: Seek on release only**

Use `onChange` to update the temporary thumb position and `onChangeCommitted` to call `seekToSection(selectedIndex)` and end the dragging state.

### Task 3: Verify the change

**Files:**

- Modify: `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx` if any follow-up fixes are needed

**Step 1: Run a focused type-aware check**

Run: `pnpm type-check`

Expected: command completes without new type errors caused by the slider change.

**Step 2: Sanity-check behavior in code**

Verify the slider is hidden with zero sections, stable with one section, and that button handlers still call the shared navigation path.

**Step 3: Commit when requested**

If the user wants a commit after review, stage the updated file and the two plan documents together with a feature commit message.
