# Song Editor Section Slider Design

## Goal

Add a small slider below the `First section` / `Prev` / `Next` / `Last section` controls in the song editor so it both indicates the currently playing notes section and lets the user seek to any notes section after releasing the thumb.

## Constraints

- Reuse the existing section navigation behavior and padding semantics.
- Do not seek continuously while the user drags.
- Keep the control compact and local to the existing navigation area.
- Hide the slider when there are no notes sections to navigate.

## Chosen Approach

Use a controlled MUI `Slider` in `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx`.

- Build the slider range from the notes sections on track `0`, which is already the source of truth for the existing section navigation buttons.
- Add a dedicated `seekToSection(index, padding?)` helper and reuse it from the button actions where it reduces duplication.
- Track the currently playing section index with the existing `useCurrentSectionIndex` hook so the thumb follows playback while idle.
- Keep a temporary drag value and `isDragging` flag so playback updates do not overwrite the thumb while the user is dragging.
- Seek only from `onChangeCommitted`, using the same default padding as the existing buttons.

## Edge Cases

- No notes sections: do not render the slider.
- One notes section: render the slider in a disabled single-position state.
- Out-of-range values: clamp to the available section index range before seeking.
- Playback before the first section: the live indicator should still resolve to the first available section.

## Verification

- Confirm the thumb moves as playback crosses sections.
- Confirm dragging updates the thumb locally without triggering a seek mid-drag.
- Confirm releasing on the first, middle, and last section seeks with the existing padding behavior.
- Confirm the existing button shortcuts and button clicks still navigate correctly.
