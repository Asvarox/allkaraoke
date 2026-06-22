# Admin Unverified Song Edit Return Link Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route the edit screen's top-left return link back to the admin unverified songs list whenever the current edit session is for an admin-managed unverified song.

**Architecture:** Reuse the existing admin-unverified-song detection in `src/routes/edit/edit.tsx` to derive a return-link destination and label. Keep the regular song-editor path unchanged so only admin unverified-song edits change behavior.

**Tech Stack:** React, TypeScript, Wouter

---

### Task 1: Update the shared edit view return link

**Files:**

- Modify: `src/routes/edit/edit.tsx`
- Reference: `src/routes/admin/unverified-song-processing-queue.ts`
- Docs: `docs/plans/2026-06-22-admin-unverified-song-edit-return-link-design.md`

**Step 1: Confirm the current return-link behavior**

Run: `sed -n '1,220p' src/routes/edit/edit.tsx`
Expected: the top-left `Link` points to `edit/list/` unconditionally.

**Step 2: Write the minimal implementation**

- Add a derived `returnLink` that uses `admin/` when `adminUnverifiedSongId` exists and `edit/list/` otherwise.
- Add a derived `returnLinkLabel` so the admin flow reads "Return to the unverified songs list".
- Update the header `Link` to use those values.

**Step 3: Verify the admin route target**

Run: `rg -n "admin/" src/routes/edit/edit.tsx src/routes/admin/unverified-song-processing-queue.ts src/app.tsx`
Expected: the edit view and admin queue logic both resolve admin return behavior through `admin/`.

**Step 4: Run a lightweight type-aware check**

Run: `pnpm type-check`
Expected: PASS with no new type errors introduced by the edit-view change.

**Step 5: Commit**

```bash
git add src/routes/edit/edit.tsx docs/plans/2026-06-22-admin-unverified-song-edit-return-link-design.md docs/plans/2026-06-22-admin-unverified-song-edit-return-link.md
git commit -m "fix: return admin unverified song edits to admin list"
```
