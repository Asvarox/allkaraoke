# Admin Unverified Song Edit Return Link Design

## Goal

Keep admins in the admin unverified-songs flow by sending the edit screen's top-left return link back to the admin unverified songs list when an admin is editing an unverified song.

## Context

The edit screen in `src/routes/edit/edit.tsx` is shared by normal library song edits and admin unverified-song edits. Today the header link is hard-coded to `edit/list/`, which drops admin users into the regular song list after opening an unverified song from `/admin`.

Admin unverified-song mode is already identified on this screen by `admin=true` together with `externalSong`, which is used to derive `adminUnverifiedSongId`.

## Chosen Approach

Derive the return-link destination from the existing admin-unverified-song state on the edit page:

- Use `admin/` when `adminUnverifiedSongId` is present.
- Keep `edit/list/` for all non-admin edits.
- Update the link label to match the destination for clarity.

## Why This Approach

This keeps the rule local to the shared edit view and avoids pushing a `returnTo` parameter through each caller. The requirement is fixed and already represented by existing query params, so a local conditional is the smallest stable change.

## Testing

- Verify the edit screen still links to `edit/list/` for regular song edits.
- Verify admin unverified-song edits, including queue mode, link to `admin/`.
