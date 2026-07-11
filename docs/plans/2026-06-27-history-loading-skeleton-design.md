# History Loading Skeleton Design

**Date:** 2026-06-27  
**Status:** Approved

## Overview

Improve the history page loading state so it renders skeletons that match the loaded layout instead of a generic loading label. At the same time, introduce a shared AKUI skeleton primitive and reuse it in song selection to eliminate the current ad hoc placeholder blocks.

## Goals

- Replace the history page `Loading…` text with a visual skeleton layout.
- Match the loaded history layout closely: one date header and four collapsed entries.
- Add a reusable AKUI `Skeleton` primitive with Storybook coverage.
- Reuse the AKUI skeleton in both history and song selection.
- Add Storybook coverage for the history page in loading, populated, and empty states.

## Approach

### Shared primitive

Create a low-level `Skeleton` component in AKUI responsible only for shimmer, radius, and size. It should be composable enough to build page-specific layouts without adding product-specific variants to the design system.

### History page structure

Split the current route into:

- `HistoryPage` — container that calls `usePlayHistory()`
- `HistoryPageView` — presentational component that renders `loading`, `empty`, and populated states

This keeps the route API clean while making Storybook straightforward and deterministic.

### History skeleton layout

Build a `HistoryPageSkeleton` from the shared AKUI `Skeleton` primitive. The skeleton should mirror the collapsed `PlayEntryCard` geometry:

- one date header block
- four list entries
- each entry with title line, metadata line(s), and thumbnail block

The structure should reuse the same spacing and width assumptions as the loaded content so the transition feels stable.

### Song selection reuse

Replace the current black pulsing blocks in song selection with composed AKUI skeleton blocks while preserving the existing row and card sizing. The group header placeholder should also switch to the shared skeleton treatment.

## Stories

### AKUI Skeleton

Add a focused component story showing common widths, heights, and rounded shapes so the primitive can be reviewed visually in isolation.

### History

Add a fullscreen history story with three named states:

- loading
- with sample data
- empty

The story should render `HistoryPageView` directly with controlled props instead of mocking hook internals.

## Out of Scope

- Changing history data loading behavior
- Session grouping changes
- New animations beyond the shared skeleton shimmer
- Keyboard navigation behavior changes
