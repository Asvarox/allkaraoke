# Song Editor Refactor Design

**Date:** 2026-05-31

## Goal

Heavily refactor the full convert wizard song editor so that:

- the whole form is managed with react-hook-form
- derived song data is exposed through context for read-only consumption
- manual TXT edits can be applied back into structured state explicitly
- field controls are composable and read from RHF/context instead of prop drilling
- sync-editor delta-style controls retain their current semantics

## Chosen Approach

Use one root react-hook-form instance for the whole convert wizard and keep all synchronization logic near the form root.

RHF is the only editable state container. A minimal context exposes derived values such as the final song, duplicate detection, parse status, and other read-only data needed across the UI. Field components remain unaware of TXT-to-structured synchronization.

## Architecture

### Root Form Model

The convert flow is backed by one RHF form covering:

- source URL
- TXT editor state
- author and video fields
- song metadata fields
- committed sync-editor song state
- sync-editor delta state
- wizard UI state that is easier to keep close to the form

### Responsibilities Split

#### RHF

- owns editable form values
- provides registration, validation, and watchers
- is the single mutable state source for the wizard

#### Convert Form Context

Context stays minimal and read-only. It exposes derived data such as:

- finalSong
- conversionResult when relevant
- duplicateCandidate
- step completion state
- parse/apply status for TXT
- whether there are pending deltas or unapplied TXT edits

Context does not expose parsing, regeneration, or mutation APIs.

#### Root Synchronization Layer

One coordinator hook/component near the form root handles:

- deriving canonical TXT from committed structured state
- applying draft TXT into structured state only on explicit user action
- dropping unapplied TXT edits when the user resumes structured form editing
- managing confirmation flow when TXT apply interacts with active sync deltas

Leaf fields do not know any of this logic exists.

## TXT Editing Model

### Two TXT States

The form keeps two TXT representations:

- canonical TXT: derived from committed structured form state
- draft TXT: the editable buffer shown in the TXT editor

Draft TXT is intentionally out-of-band until the user explicitly applies it.

### Apply Behavior

Editing draft TXT does not update structured fields automatically.

When the user clicks Apply TXT:

1. Validate the draft TXT.
2. Parse it into a song model.
3. If valid, commit it into structured RHF state.
4. Regenerate canonical TXT from committed state.
5. Keep draft TXT aligned with the committed canonical TXT.

If parsing fails, no structured state changes are applied and the TXT editor shows the error.

### Structured Edit Behavior

If the user edits draft TXT without applying it and then edits the structured form, the draft TXT changes are dropped silently.

After that, canonical TXT continues to be regenerated from the structured form state.

This is intentional because manual TXT edits are expected to be infrequent and should not compete with normal form editing.

## Sync Editor Semantics

The sync editor should keep its current mental model.

The committed song state remains the base song. Controls such as gap shift do not directly edit canonical song fields. They are stored as delta-like values and applied on top of the committed base when deriving the effective final song.

Examples include:

- gap shift
- video gap shift
- BPM override or BPM delta, depending on final implementation choice
- section changes
- track name changes
- lyric changes

This keeps the current editing experience intact and makes TXT apply/reset behavior easier to reason about.

### Applying TXT With Active Deltas

If the user clicks Apply TXT while any delta fields are non-neutral, show a confirmation dialog with exactly two actions:

1. Apply deltas into TXT and reset deltas
2. Cancel

If the user confirms:

1. Parse the draft TXT into a base song.
2. Apply the current delta transforms onto that parsed song.
3. Commit the result into structured RHF state.
4. Regenerate canonical TXT from the committed song.
5. Reset all delta controls to their neutral values.

If the user cancels, nothing changes.

There is no third option to keep deltas pending after applying TXT.

## Component Split

### Root and Hooks

- `src/routes/convert/convert-form.tsx`
- `src/routes/convert/convert-form-context.tsx`
- `src/routes/convert/hooks/use-convert-form-derived.ts`
- `src/routes/convert/hooks/use-convert-form-sync.ts`
- `src/routes/convert/hooks/use-convert-step-state.ts`
- `src/routes/convert/hooks/use-apply-txt-flow.ts`

### Step Shells

- `src/routes/convert/steps/basic-data-step.tsx`
- `src/routes/convert/steps/author-and-video-step.tsx`
- `src/routes/convert/steps/sync-step.tsx`
- `src/routes/convert/steps/song-metadata-step.tsx`

### Basic Data Controls

- `src/routes/convert/controls/source-url-field.tsx`
- `src/routes/convert/controls/txt-editor.tsx`

`txt-editor.tsx` owns the draft textarea plus its local action surface:

- apply TXT
- revert TXT
- parse status
- copy TXT
- TXT preview, if still needed
- fix-diacritics actions

### Author and Video Controls

- `src/routes/convert/controls/author-field.tsx`
- `src/routes/convert/controls/author-url-field.tsx`
- `src/routes/convert/controls/video-url-field.tsx`
- `src/routes/convert/controls/video-id-preview.tsx`

### Sync Controls

- `src/routes/convert/controls/sync-editor.tsx`
- `src/routes/convert/controls/gap-shift-field.tsx`
- `src/routes/convert/controls/video-gap-shift-field.tsx`
- `src/routes/convert/controls/bpm-override-field.tsx`
- `src/routes/convert/controls/playback-speed-control.tsx`
- `src/routes/convert/controls/apply-txt-with-deltas-dialog.tsx`

`sync-editor.tsx` is a single domain control for the current edit-verses surface. It may be internally split into smaller private components for readability, but it remains one public control boundary.

Top stepper and footer actions remain part of layout, not standalone control files.

### Metadata Controls

- `src/routes/convert/controls/song-artist-field.tsx`
- `src/routes/convert/controls/song-title-field.tsx`
- `src/routes/convert/controls/song-genre-field.tsx`
- `src/routes/convert/controls/song-edition-field.tsx`
- `src/routes/convert/controls/song-language-field.tsx`
- `src/routes/convert/controls/artist-origin-field.tsx`
- `src/routes/convert/controls/release-year-field.tsx`
- `src/routes/convert/controls/real-bpm-field.tsx`
- `src/routes/convert/controls/preview-range-field.tsx`
- `src/routes/convert/controls/volume-field.tsx`

`preview-range-field.tsx` should model the preview window as one control, likely with a two-thumb slider.

## Validation and Error Handling

### Regular Field Validation

RHF handles field-level validation for normal inputs, including:

- required fields like artist, title, year, language, and video where applicable
- numeric validation for BPM and related fields
- URL validation where useful

### TXT Validation

TXT validation is separate from field validation.

- invalid draft TXT should not poison the committed form state
- TXT parse errors are displayed in the TXT editor
- save is blocked only by invalid committed form state, not by invalid draft TXT

### Derived Final Song

`finalSong` is derived from the committed RHF state plus active sync-editor deltas.

This preserves the current editing semantics while keeping save behavior aligned with what the user sees in the preview.

## Testing Strategy

### Unit Tests

Add focused tests for root synchronization logic:

- structured edit regenerates canonical TXT
- dirty draft TXT is dropped on structured edit
- valid draft TXT apply updates committed fields
- invalid draft TXT apply leaves committed state unchanged
- applying TXT with active deltas opens the confirmation flow
- confirming applies deltas into the parsed TXT result and resets delta fields

### Component Tests

Add component tests for the highest-value domain controls:

- `txt-editor.tsx`
- `sync-editor.tsx`
- `preview-range-field.tsx`

### E2E Coverage

Add or update focused wizard coverage for:

- create flow from pasted TXT
- edit existing song flow
- manual TXT edit plus explicit apply
- manual TXT edit followed by structured edit that silently drops draft changes
- sync-editor delta flow affecting the saved song

## Migration Strategy

Refactor incrementally while preserving behavior:

1. Introduce the root RHF form and derived context.
2. Move existing step state into the new form model.
3. Introduce the TXT coordinator behavior.
4. Extract basic controls and metadata controls into RHF-native components.
5. Refactor the sync editor into the committed-base-plus-deltas model under RHF.
6. Replace old prop-driven step wiring with step shells bound to RHF and read-only context.
7. Update tests around each migration slice.

This keeps the visible flow stable while internals are restructured.

## Non-Goals

This refactor should not broaden scope into unrelated UX redesign or song-processing changes.

It should preserve existing wizard behavior unless a behavior change is explicitly documented above.