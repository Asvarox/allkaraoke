---
name: using-storybook
description: 'Conventions for this project''s Storybook — how stories are filed under Foundations / Components / Game, and the rule that any change to the design language must be reflected in the using-tailwind skill. Use when adding or changing a story, or when changing a design token.'
---

# Storybook

Stories live in three sections:

- **Foundations** — the tokens themselves: Colours, Typography, Surfaces, Layers. These pages read
  their values back out of the DOM rather than printing numbers typed into the story, so they cannot
  drift from what the stylesheet actually produces. Keep that property when editing them.
- **Components** — the generic AKUI kit.
- **Game** — real screens and the pieces they are assembled from.

`storySort` in `.storybook/preview.tsx` pins that order; it is the order the system is built in
rather than alphabetical.

## Keep the tailwind skill in step

**Any change to the design language must be reflected in the `using-tailwind` skill.**

That skill is the gist an agent reads before styling anything, and Storybook is where the language is
actually defined. If a token is added, renamed, retired or given a different meaning — a new status
role, a changed surface step, another rung on the z-index ladder — update `using-tailwind/SKILL.md`
in the same change.

A skill that describes a system the code no longer has is worse than no skill: it gets followed. The
previous version of `using-tailwind` still pointed at `AKUI/Primitives/` paths that had been
lowercased, described `Box` with a background it no longer had, and warned against two variants that
no longer existed.
