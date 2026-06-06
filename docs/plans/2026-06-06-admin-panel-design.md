# Admin Panel Design

## Goal

Build a hidden admin panel at `/admin` for managing unverified shared songs stored in Cloudflare KV. The first version should list shared songs, delete entries, regenerate the shared-song index, and open an edit flow that can save corrections back to KV while still saving the corrected song locally.

## Context

The app already stores unverified shared songs in `SHARED_SONGS_KV` under `shared-song:<externalSongId>` keys. Public endpoints search the index and fetch individual shared songs:

- `GET /shared-songs`
- `GET /shared-song?id=<externalSongId>`

The existing CI-facing admin endpoint, `functions/shared-songs-admin.ts`, uses `SHARED_SONGS_ADMIN_TOKEN` for scripted upsert/delete/index regeneration. The new browser admin panel should not reuse that CI token. It should use a separate backend password value.

The existing edit route can already load shared songs through `/edit/song/?externalSong=<externalSongId>`.

## Chosen Approach

Add a dedicated browser-admin API instead of expanding the CI admin endpoint:

- Keep `/shared-songs-admin` token-protected for CI automation.
- Add a new browser-admin function protected by a separate password, for example `SHARED_SONGS_ADMIN_PASSWORD`.
- Reuse and extend `functions/shared-songs-store.ts` so both admin surfaces share KV behavior without duplicating storage logic.

This keeps human admin behavior separate from automation while giving the frontend one simple contract.

## Admin Authentication

The admin panel has no login endpoint. The frontend asks for a password, stores it in `sessionStorage`, and sends it on every admin request as a header such as `x-shared-songs-admin-password`.

If the password is missing or wrong, the backend returns `401`. The frontend treats this as an empty list plus a small wrong-password/error message.

The admin page includes a logout button. Logout clears the stored password from `sessionStorage` and redirects or reloads to `/admin`, returning the user to the password prompt.

## Admin API

Add a dedicated admin endpoint namespace, likely under `/admin/shared-songs`.

### List

`GET /admin/shared-songs`

Returns all shared songs from the existing `shared-songs-index`. This is intentionally index-backed for the first version.

The response should include enough fields for the table:

- `externalSongId`
- `songId`
- `artist`
- `title`
- `language`
- `videoId`

### Delete

`DELETE /admin/shared-songs?id=<externalSongId>`

Deletes the KV record and removes the entry from the index. The frontend refetches the list after success.

### Regenerate Index

Use either:

- `PUT /admin/shared-songs/index`
- `POST /admin/shared-songs/regenerate-index`

The action scans `shared-song:` KV keys and rewrites `shared-songs-index`. The frontend refetches the list after success.

### Update Existing Shared Song

`PUT /admin/shared-song?id=<externalSongId>`

Updates the existing KV record in place after an admin edit.

Rules:

- Keep `externalSongId` stable as the KV key.
- Require the record to already exist; do not create a new record for a mistyped id.
- Convert the corrected song back to `.txt`.
- Update searchable metadata: `songId`, `artist`, `title`, `language`, `videoId`, and `songTxt`.
- Preserve original source metadata where possible: `firstSeenAt`, `sourceUserId`, `sourceEventAt`.
- Refresh index data after the update.

## Frontend Route

Add a hidden `/admin` route. Do not add it to the normal app menus.

Unauthenticated state:

- Show a password field and submit button.
- On submit, write the password to `sessionStorage` and request the list.

Authenticated state:

- Show a simple admin page styled like the existing edit-song list.
- Use a centered white container and `MaterialReactTable`.
- Use client-side filtering and sorting.
- Include header actions for refresh, regenerate index, and logout.

Table actions:

- Edit: open `/edit/song/?externalSong=<externalSongId>&admin=true`.
- Delete: confirm, call the admin delete endpoint, then refetch.

Columns should include artist, title, language, video id, song id, external id, and actions. Less-used IDs can be hidden by default if still available through table controls.

## Admin Edit Flow

When the edit route is opened with shared-song admin context, the editor should load the song as it already does through `externalSong`.

On save:

1. Save the corrected song to local browser storage, preserving existing editor behavior.
2. Read the admin password from `sessionStorage`.
3. Send the corrected song to the admin KV update endpoint for the stable `externalSongId`.
4. Return to `/admin` after the KV update succeeds.

If local save succeeds but the KV update fails, the editor should surface that failure and avoid redirecting so the admin can retry.

## Error Handling

Unauthorized admin requests show a wrong-password state and an empty table.

Delete, update, and regenerate failures should show a clear inline error or existing app notification if a suitable notification primitive is already in use.

Admin edit save should not redirect if the KV update fails.

## Testing

Add focused tests for:

- KV store helper behavior, especially updating a record while preserving `externalSongId`.
- Admin API password rejection.
- Successful admin list/delete/update/regenerate behavior.
- Frontend password storage and logout behavior.
- Admin edit save returning to `/admin` after KV update success.

Run `pnpm type-check` as baseline verification.
