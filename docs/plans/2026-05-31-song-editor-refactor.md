# Song Editor Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the full convert wizard to use a single react-hook-form model, derived read-only context, explicit TXT apply flow, and a sync editor that keeps delta-style editing semantics.

**Architecture:** Introduce one root convert form layer that owns all editable state through react-hook-form. Keep TXT apply/drop logic in a single synchronization hook, expose only derived read-only values through context, and migrate each step into RHF-native controls without changing the visible wizard flow.

**Tech Stack:** React 19, TypeScript, react-hook-form, MUI, Vitest, Testing Library, Playwright

---

### Task 1: Create the root convert form model

**Files:**

- Create: `src/routes/convert/convert-form.tsx`
- Create: `src/routes/convert/convert-form-context.tsx`
- Create: `src/routes/convert/hooks/use-convert-form-derived.ts`
- Create: `src/routes/convert/hooks/use-convert-step-state.ts`
- Create: `src/routes/convert/convert-form.test.tsx`
- Modify: `src/routes/convert/convert-view.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import ConvertForm from './convert-form';

it('exposes derived final song data through context', () => {
  render(<ConvertForm initialSong={undefined}><div data-test="child" /></ConvertForm>);

  expect(screen.getByTestId('child')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/routes/convert/convert-form.test.tsx --runInBand`

Expected: FAIL because `convert-form.tsx` does not exist yet.

**Step 3: Write minimal implementation**

Create a root form wrapper that:

- creates one `useForm` instance for the whole wizard
- seeds default values from the existing `song` prop or blank convert defaults
- wraps children in RHF `FormProvider`
- computes read-only derived values in `use-convert-form-derived.ts`
- exposes those derived values through `convert-form-context.tsx`
- keeps stepper/save wiring in `convert-view.tsx`, but moves mutable state ownership into `ConvertForm`

The first implementation can keep existing step components mounted through adapters, as long as local `useState` ownership is removed from `convert-view.tsx`.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/routes/convert/convert-form.test.tsx --runInBand`

Expected: PASS.

**Step 5: Run narrow typecheck**

Run: `pnpm type-check`

Expected: PASS.

**Step 6: Commit**

```bash
git add src/routes/convert/convert-form.tsx src/routes/convert/convert-form-context.tsx src/routes/convert/hooks/use-convert-form-derived.ts src/routes/convert/hooks/use-convert-step-state.ts src/routes/convert/convert-form.test.tsx src/routes/convert/convert-view.tsx
git commit -m "refactor: add root convert form model"
```

### Task 2: Migrate basic data and author/video steps to RHF controls

**Files:**

- Create: `src/routes/convert/steps/basic-data-step.tsx`
- Create: `src/routes/convert/steps/author-and-video-step.tsx`
- Create: `src/routes/convert/controls/source-url-field.tsx`
- Create: `src/routes/convert/controls/txt-editor.tsx`
- Create: `src/routes/convert/controls/author-field.tsx`
- Create: `src/routes/convert/controls/author-url-field.tsx`
- Create: `src/routes/convert/controls/video-url-field.tsx`
- Create: `src/routes/convert/controls/video-id-preview.tsx`
- Create: `src/routes/convert/controls/txt-editor.test.tsx`
- Modify: `src/routes/convert/convert-form.tsx`
- Modify: `src/routes/convert/import-ultrastar-es-song.ts`
- Modify: `tests/page-objects/song-edit-basic-info-page.ts`
- Modify: `tests/page-objects/song-edit-author-and-video-page.ts`
- Modify: `tests/convert-song.spec.ts`

**Step 1: Write the failing tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TxtEditor from './txt-editor';

it('renders the draft txt field and helper actions from form state', async () => {
  render(<TxtEditor />);

  expect(screen.getByLabelText("Song's UltraStar .TXT file contents")).toBeVisible();
  expect(screen.getByRole('button', { name: /fix/i })).toBeVisible();
});
```

Add a focused E2E assertion in `tests/convert-song.spec.ts` that still pastes TXT and reaches the author/video step successfully.

**Step 2: Run tests to verify they fail**

Run: `pnpm test src/routes/convert/controls/txt-editor.test.tsx --runInBand`

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Expected: FAIL because the new controls and selectors do not exist yet.

**Step 3: Write minimal implementation**

Move the existing basic-data and author/video inputs into RHF-native control files:

- each control reads its value from `useFormContext` / `Controller`
- `basic-data-step.tsx` uses `SourceUrlField` and `TxtEditor`
- `author-and-video-step.tsx` uses the author/video controls
- preserve existing data-test selectors or update page objects in the same task
- keep auto-import behavior triggered from the source URL field, but write into RHF instead of prop callbacks

Keep the control API local. These files should not accept business-state props.

**Step 4: Run tests to verify they pass**

Run: `pnpm test src/routes/convert/controls/txt-editor.test.tsx --runInBand`

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/convert/steps/basic-data-step.tsx src/routes/convert/steps/author-and-video-step.tsx src/routes/convert/controls/source-url-field.tsx src/routes/convert/controls/txt-editor.tsx src/routes/convert/controls/author-field.tsx src/routes/convert/controls/author-url-field.tsx src/routes/convert/controls/video-url-field.tsx src/routes/convert/controls/video-id-preview.tsx src/routes/convert/controls/txt-editor.test.tsx src/routes/convert/convert-form.tsx src/routes/convert/import-ultrastar-es-song.ts tests/page-objects/song-edit-basic-info-page.ts tests/page-objects/song-edit-author-and-video-page.ts tests/convert-song.spec.ts
git commit -m "refactor: migrate convert basic inputs to rhf"
```

### Task 3: Implement the TXT apply/drop synchronization flow

**Files:**

- Create: `src/routes/convert/hooks/use-convert-form-sync.ts`
- Create: `src/routes/convert/hooks/use-apply-txt-flow.ts`
- Create: `src/routes/convert/hooks/use-convert-form-sync.test.tsx`
- Modify: `src/routes/convert/controls/txt-editor.tsx`
- Modify: `src/routes/convert/convert-form.tsx`
- Modify: `src/routes/convert/hooks/use-convert-form-derived.ts`
- Modify: `tests/page-objects/song-edit-basic-info-page.ts`
- Modify: `tests/convert-song.spec.ts`

**Step 1: Write the failing tests**

```tsx
import { renderHook, act } from '@testing-library/react';
import { useConvertFormSync } from './use-convert-form-sync';

it('drops unapplied draft txt changes when a structured field changes', () => {
  const { result } = renderHook(() => useConvertFormSync(/* wrapper with RHF */));

  act(() => result.current.setDraftTxt('#TITLE:Changed'));
  act(() => result.current.onStructuredFieldChange('metadata.artist', 'Updated Artist'));

  expect(result.current.draftDirty).toBe(false);
});
```

Add tests for:

- valid draft TXT applies into committed fields
- invalid draft TXT leaves committed state untouched
- canonical TXT regenerates from committed structured state

Add a new E2E step in `tests/convert-song.spec.ts` that edits TXT, does not apply it, edits a normal field, and verifies the draft is discarded.

**Step 2: Run tests to verify they fail**

Run: `pnpm test src/routes/convert/hooks/use-convert-form-sync.test.tsx --runInBand`

Expected: FAIL because the sync hook does not exist yet.

**Step 3: Write minimal implementation**

Implement one synchronization hook that:

- keeps `txt.canonical`, `txt.draft`, `txt.draftDirty`, and `txt.parseError`
- updates structured form values only when `Apply TXT` is clicked
- silently drops dirty draft TXT on structured form edits
- regenerates canonical TXT from committed structured state
- keeps draft TXT aligned with canonical TXT after successful apply or structured edits

The TXT editor should remain a UI shell around this behavior and only trigger the explicit apply/revert actions.

**Step 4: Run tests to verify they pass**

Run: `pnpm test src/routes/convert/hooks/use-convert-form-sync.test.tsx --runInBand`

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/convert/hooks/use-convert-form-sync.ts src/routes/convert/hooks/use-apply-txt-flow.ts src/routes/convert/hooks/use-convert-form-sync.test.tsx src/routes/convert/controls/txt-editor.tsx src/routes/convert/convert-form.tsx src/routes/convert/hooks/use-convert-form-derived.ts tests/page-objects/song-edit-basic-info-page.ts tests/convert-song.spec.ts
git commit -m "refactor: add explicit txt apply flow"
```

### Task 4: Move the sync editor to committed-base-plus-deltas RHF state

**Files:**

- Create: `src/routes/convert/steps/sync-step.tsx`
- Create: `src/routes/convert/controls/sync-editor.tsx`
- Create: `src/routes/convert/controls/gap-shift-field.tsx`
- Create: `src/routes/convert/controls/video-gap-shift-field.tsx`
- Create: `src/routes/convert/controls/bpm-override-field.tsx`
- Create: `src/routes/convert/controls/playback-speed-control.tsx`
- Create: `src/routes/convert/controls/apply-txt-with-deltas-dialog.tsx`
- Create: `src/routes/convert/controls/sync-editor.test.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video/components/edit-section.tsx`
- Modify: `src/routes/convert/convert-form.tsx`
- Modify: `src/routes/convert/hooks/use-convert-form-derived.ts`
- Modify: `src/routes/convert/hooks/use-apply-txt-flow.ts`
- Modify: `tests/page-objects/song-edit-sync-lyrics-to-video-page.ts`
- Modify: `tests/convert-song.spec.ts`
- Modify: `tests/edit-song.spec.ts`

**Step 1: Write the failing tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SyncEditor from './sync-editor';

it('shows a confirmation dialog when applying txt with active deltas', async () => {
  render(<SyncEditor />);

  await userEvent.type(screen.getByLabelText(/gap shift/i), '1000');
  await userEvent.click(screen.getByRole('button', { name: /apply txt/i }));

  expect(screen.getByText(/apply deltas into txt and reset deltas/i)).toBeVisible();
});
```

Also add a unit test for the apply flow confirming that accepting the dialog:

- parses the draft TXT base
- applies active deltas
- commits the result
- resets delta fields

**Step 2: Run tests to verify they fail**

Run: `pnpm test src/routes/convert/controls/sync-editor.test.tsx --runInBand`

Expected: FAIL because RHF wiring and confirmation flow do not exist yet.

**Step 3: Write minimal implementation**

Refactor the current sync editor so that:

- `sync-editor.tsx` becomes the main public control boundary
- committed base song lives in RHF state
- gap/video-gap/BPM/section/track/lyric edits live as RHF delta values
- derived final song applies deltas on top of the committed base
- apply-TXT confirmation uses the agreed two-action dialog:
  - apply deltas into TXT and reset deltas
  - cancel

You may keep private subcomponents inside the sync-editor folder if that improves readability, but do not reintroduce prop-drilled business state.

**Step 4: Run tests to verify they pass**

Run: `pnpm test src/routes/convert/controls/sync-editor.test.tsx --runInBand`

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Run: `pnpm e2e tests/edit-song.spec.ts --project="chromium"`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/convert/steps/sync-step.tsx src/routes/convert/controls/sync-editor.tsx src/routes/convert/controls/gap-shift-field.tsx src/routes/convert/controls/video-gap-shift-field.tsx src/routes/convert/controls/bpm-override-field.tsx src/routes/convert/controls/playback-speed-control.tsx src/routes/convert/controls/apply-txt-with-deltas-dialog.tsx src/routes/convert/controls/sync-editor.test.tsx src/routes/convert/steps/sync-lyrics-to-video.tsx src/routes/convert/steps/sync-lyrics-to-video/edit-song.tsx src/routes/convert/steps/sync-lyrics-to-video/components/edit-section.tsx src/routes/convert/convert-form.tsx src/routes/convert/hooks/use-convert-form-derived.ts src/routes/convert/hooks/use-apply-txt-flow.ts tests/page-objects/song-edit-sync-lyrics-to-video-page.ts tests/convert-song.spec.ts tests/edit-song.spec.ts
git commit -m "refactor: move sync editor into rhf state"
```

### Task 5: Migrate metadata fields and preview range control

**Files:**

- Create: `src/routes/convert/steps/song-metadata-step.tsx`
- Create: `src/routes/convert/controls/song-artist-field.tsx`
- Create: `src/routes/convert/controls/song-title-field.tsx`
- Create: `src/routes/convert/controls/song-genre-field.tsx`
- Create: `src/routes/convert/controls/song-edition-field.tsx`
- Create: `src/routes/convert/controls/song-language-field.tsx`
- Create: `src/routes/convert/controls/artist-origin-field.tsx`
- Create: `src/routes/convert/controls/release-year-field.tsx`
- Create: `src/routes/convert/controls/real-bpm-field.tsx`
- Create: `src/routes/convert/controls/preview-range-field.tsx`
- Create: `src/routes/convert/controls/volume-field.tsx`
- Create: `src/routes/convert/controls/preview-range-field.test.tsx`
- Modify: `src/routes/convert/steps/song-metadata.tsx`
- Modify: `src/routes/convert/steps/preview-and-volume-adjustment.tsx`
- Modify: `src/routes/convert/convert-form.tsx`
- Modify: `tests/page-objects/song-edit-metadata-page.ts`
- Modify: `tests/convert-song.spec.ts`
- Modify: `tests/convert-and-sing-a-song.spec.ts`

**Step 1: Write the failing tests**

```tsx
import { render, screen } from '@testing-library/react';
import PreviewRangeField from './preview-range-field';

it('binds preview start and end as one range control', () => {
  render(<PreviewRangeField />);

  expect(screen.getByRole('slider', { name: /preview/i })).toBeVisible();
});
```

Also extend the existing convert E2E to confirm the preview range and metadata values still persist through save.

**Step 2: Run tests to verify they fail**

Run: `pnpm test src/routes/convert/controls/preview-range-field.test.tsx --runInBand`

Expected: FAIL because the new metadata controls do not exist yet.

**Step 3: Write minimal implementation**

Extract each metadata field into its own RHF-aware control and replace the current prop-driven metadata step.

Model preview start/end as one control boundary in `preview-range-field.tsx`, even if it renders multiple internal elements.

Preserve default-value behaviors such as artist origin suggestions and current video preview calculations, but route them through RHF-derived state.

**Step 4: Run tests to verify they pass**

Run: `pnpm test src/routes/convert/controls/preview-range-field.test.tsx --runInBand`

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Run: `pnpm e2e tests/convert-and-sing-a-song.spec.ts --project="chromium"`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/convert/steps/song-metadata-step.tsx src/routes/convert/controls/song-artist-field.tsx src/routes/convert/controls/song-title-field.tsx src/routes/convert/controls/song-genre-field.tsx src/routes/convert/controls/song-edition-field.tsx src/routes/convert/controls/song-language-field.tsx src/routes/convert/controls/artist-origin-field.tsx src/routes/convert/controls/release-year-field.tsx src/routes/convert/controls/real-bpm-field.tsx src/routes/convert/controls/preview-range-field.tsx src/routes/convert/controls/volume-field.tsx src/routes/convert/controls/preview-range-field.test.tsx src/routes/convert/steps/song-metadata.tsx src/routes/convert/steps/preview-and-volume-adjustment.tsx src/routes/convert/convert-form.tsx tests/page-objects/song-edit-metadata-page.ts tests/convert-song.spec.ts tests/convert-and-sing-a-song.spec.ts
git commit -m "refactor: migrate convert metadata controls"
```

### Task 6: Replace old step wiring, clean up adapters, and finalize coverage

**Files:**

- Modify: `src/routes/convert/convert-view.tsx`
- Modify: `src/routes/convert/convert.tsx`
- Modify: `src/routes/convert/steps/basic-data.tsx`
- Modify: `src/routes/convert/steps/author-and-video.tsx`
- Modify: `src/routes/convert/steps/song-metadata.tsx`
- Modify: `src/routes/convert/steps/sync-lyrics-to-video.tsx`
- Modify: `tests/convert-song.spec.ts`
- Modify: `tests/edit-song.spec.ts`
- Modify: `tests/selection-playlist.spec.ts`
- Modify: `tests/remote-song-list.spec.ts`
- Modify: `tests/page-objects/initialise.ts`

**Step 1: Write the failing regression test**

Add or extend one E2E scenario that covers the full explicit TXT behavior:

- enter TXT
- change draft TXT
- do not apply it
- edit a structured field
- verify draft was discarded
- save successfully

Use the existing convert flow as the base in `tests/convert-song.spec.ts`.

**Step 2: Run test to verify it fails**

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Expected: FAIL because the old step wiring and selectors still leak previous behavior.

**Step 3: Write minimal implementation**

Remove temporary compatibility wiring and make the RHF-based step shells the only path.

Clean up old step components so they either become thin wrappers around the new step shells or are deleted if they are no longer referenced.

Update page objects and related convert-dependent specs so selector drift is fixed in one place.

Reference skills while executing:

- `@writing-e2e-tests` for Playwright updates
- `@e2e-playwright` when debugging the convert flow in the browser

**Step 4: Run focused validation**

Run: `pnpm e2e tests/convert-song.spec.ts --project="chromium"`

Run: `pnpm e2e tests/edit-song.spec.ts --project="chromium"`

Run: `pnpm type-check`

Expected: PASS.

**Step 5: Run final regression sweep**

Run: `pnpm test src/routes/convert/**/*.test.tsx src/routes/convert/**/*.test.ts --runInBand`

Run: `pnpm e2e tests/convert-and-sing-a-song.spec.ts --project="chromium"`

Run: `pnpm e2e tests/selection-playlist.spec.ts --project="chromium"`

Expected: PASS.

**Step 6: Commit**

```bash
git add src/routes/convert/convert-view.tsx src/routes/convert/convert.tsx src/routes/convert/steps/basic-data.tsx src/routes/convert/steps/author-and-video.tsx src/routes/convert/steps/song-metadata.tsx src/routes/convert/steps/sync-lyrics-to-video.tsx tests/convert-song.spec.ts tests/edit-song.spec.ts tests/selection-playlist.spec.ts tests/remote-song-list.spec.ts tests/page-objects/initialise.ts
git commit -m "refactor: finalize rhf convert wizard"
```

## Notes for the Implementer

- Preserve existing `data-test` selectors where practical to minimize page-object churn.
- Do not expose parser/regenerator functions through context.
- Keep TXT draft state separate from committed structured state.
- Keep sync-editor delta semantics intact; do not flatten everything into direct song mutations.
- If the two-thumb preview slider proves awkward with current controls, keep one component boundary with internal dual inputs as an intermediate step, then swap the internals later.
- Avoid wide UI redesign. This plan is about internal structure and behavior.