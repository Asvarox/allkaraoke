# History Loading Skeleton Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared AKUI skeleton primitive, reuse it in song selection and history, and add Storybook coverage for both the primitive and the history page states.

**Architecture:** Extract a presentational `HistoryPageView` so the route stays hook-backed while Storybook can render controlled states. Build a low-level AKUI `Skeleton` primitive, then compose page-specific loading layouts for song selection and history from that shared building block.

**Tech Stack:** React, TypeScript, Tailwind CSS, Storybook, react-twc (existing project usage), AKUI primitives

---

### Task 1: Add the AKUI skeleton primitive

**Files:**

- Create: `src/modules/elements/akui/skeleton.tsx`
- Create: `src/modules/elements/akui/skeleton.stories.tsx`

**Step 1: Write the component**

Create a reusable skeleton block with:

- optional `className`
- optional `asChild`
- optional width/height via inline style
- default shimmer classes and neutral background

**Step 2: Add a Storybook story**

Render a small gallery that shows:

- text-line skeletons
- thumbnail/card blocks
- pill/circle variants

**Step 3: Verify story typing**

Run: `pnpm exec tsc --noEmit`
Expected: no type errors from the new AKUI files

### Task 2: Reuse the skeleton primitive in song selection

**Files:**

- Modify: `src/routes/sing-a-song/song-selection/song-selection.tsx`
- Modify: `src/routes/sing-a-song/song-selection/components/song-group-header.tsx`

**Step 1: Replace the loading placeholders**

Swap the current `animate-pulse` black blocks for composed AKUI `Skeleton` blocks while preserving:

- current card width and height
- current group-header placeholder footprint
- current loading row counts

**Step 2: Keep visual layout stable**

Use the existing CSS variables and spacing so the skeleton footprint remains aligned with loaded content.

### Task 3: Extract a presentational history view and matching skeleton layout

**Files:**

- Modify: `src/routes/history/history-page.tsx`
- Create: `src/routes/history/history-page-view.tsx`
- Create: `src/routes/history/history-page-skeleton.tsx`
- Modify: `src/routes/history/play-entry-card.tsx`

**Step 1: Split route and view**

Move rendering logic into `HistoryPageView({ groups, loading, expandedKey, onToggleEntry, registerBack, registerEntry })` or a simpler prop shape that still preserves current keyboard navigation behavior in the route container.

**Step 2: Add a history skeleton layout**

Render:

- one date header skeleton
- four collapsed card skeleton rows
- each row with text placeholders and thumbnail placeholder aligned to the real card

**Step 3: Replace loading text**

Use the skeleton view instead of `Menu.HelpText>Loading…</Menu.HelpText>`.

### Task 4: Add history Storybook coverage

**Files:**

- Create: `src/routes/history/history-page.stories.tsx`

**Step 1: Add sample fixtures**

Define a small in-file dataset with:

- at least one group with multiple entries
- a mix of normal and deleted-song entries if useful

**Step 2: Add three stories**

Render `HistoryPageView` in:

- loading state
- populated state
- empty state

**Step 3: Use fullscreen layout**

Match the route presentation so spacing and skeleton geometry are reviewable.

### Task 5: Verify targeted behavior

**Files:**

- Review only

**Step 1: Run targeted type checking if the project command is too broad**

Run: `pnpm exec tsc --noEmit`
Expected: pass

**Step 2: Run targeted tests if needed**

Run: `pnpm vitest run src/routes/history/use-play-history.test.ts`
Expected: pass

**Step 3: Run Storybook-related verification if available**

At minimum, ensure story files type-check with the rest of the project.

**Step 4: Commit**

```bash
git add docs/plans/2026-06-27-history-loading-skeleton-design.md docs/plans/2026-06-27-history-loading-skeleton.md src/modules/elements/akui/skeleton.tsx src/modules/elements/akui/skeleton.stories.tsx src/routes/sing-a-song/song-selection/song-selection.tsx src/routes/sing-a-song/song-selection/components/song-group-header.tsx src/routes/history/history-page.tsx src/routes/history/history-page-view.tsx src/routes/history/history-page-skeleton.tsx src/routes/history/history-page.stories.tsx
git commit -m "feat: add shared skeleton loading states"
```
