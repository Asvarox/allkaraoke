# Song Editor Sync BPM Shortcuts Design

## Goal

Add two faster sync-editor actions:

- a button inside `Target last note end time (ms)` that copies the current player time into the field
- a clickable estimated BPM value that immediately applies that BPM to the `Tempo (BPM) of the lyrics` field

## Context

The sync step already exposes the current player time in the playback panel and already keeps the BPM input controlled from `edit-song.tsx` via `overrideBpm`. The missing piece is direct wiring between those existing values and the BPM helper UI.

## Chosen Approach

Keep the change local to the existing sync BPM controls.

- Extend `ManipulateBpm` with one callback that reads the current player time from the parent.
- Add an input end-adornment button on the target-last-note field that calls that callback and writes the rounded millisecond value into local component state.
- Render the estimated BPM value as a clickable control that immediately calls the existing `onChange` prop, so the controlled BPM field updates through the current parent state path.

## Why This Approach

- It reuses the existing single source of truth for BPM updates.
- It avoids lifting the target-last-note helper state into the parent unnecessarily.
- It matches the current UI pattern of action buttons embedded in text inputs.

## Testing

- Extend the existing Playwright sync-step page object with locators for the new controls.
- Verify the current-time button copies the displayed player time into the target-last-note input.
- Verify clicking the estimated BPM applies that value to the BPM input immediately.
