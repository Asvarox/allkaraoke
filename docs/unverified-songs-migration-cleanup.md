# Unverified Songs Secret Migration and Cleanup

This document tracks the follow-up work after the shared-song to unverified-song naming migration.

Shared Song means a song submitted to PostHog. Unverified Song means a shared song that has been upserted to Cloudflare KV and is playable by other players.

## Secret setup commands

Run these from the repository root. Replace placeholder values before running. Do not commit secret values.

### GitHub repository secrets

These secrets are used by the GitHub Actions workflows that promote PostHog shared songs into Cloudflare KV unverified songs.

```bash
gh secret set UNVERIFIED_SONGS_ADMIN_URL --body "https://<production-origin>"
gh secret set UNVERIFIED_SONGS_ADMIN_TOKEN --body "<ci-admin-token>"
gh secret list
```

If running from outside this checkout, add the repository selector:

```bash
gh secret set UNVERIFIED_SONGS_ADMIN_URL --repo <owner>/<repo> --body "https://<production-origin>"
gh secret set UNVERIFIED_SONGS_ADMIN_TOKEN --repo <owner>/<repo> --body "<ci-admin-token>"
gh secret list --repo <owner>/<repo>
```

`POSTHOG_PAT_KEY` is still required by the promotion workflow, but it is not part of this rename unless it is missing.

### Cloudflare Worker secrets

Use this form if production deploys the Worker from `wrangler.jsonc`.

```bash
pnpm wrangler secret put UNVERIFIED_SONGS_ADMIN_TOKEN
pnpm wrangler secret put ADMIN_PANEL_PASSWORD
```

Wrangler prompts for each value interactively. If using Wrangler environments, add `--env <environment>` to each command.

### Cloudflare Pages secrets

Use this form if production deploys as a Cloudflare Pages project.

```bash
pnpm wrangler pages secret put UNVERIFIED_SONGS_ADMIN_TOKEN --project-name allkaraoke-party
pnpm wrangler pages secret put ADMIN_PANEL_PASSWORD --project-name allkaraoke-party
```

The KV binding and key prefix are intentionally not part of this secret migration. Keep `SHARED_SONGS_KV`, `shared-song:<sharedSongId>`, and `shared-songs-index` unless a separate storage migration is planned.

## Compatibility kept during migration

The code currently accepts new and old names so deployment can happen without breaking existing workflows or clients.

- GitHub Actions prefer `UNVERIFIED_SONGS_ADMIN_URL` and `UNVERIFIED_SONGS_ADMIN_TOKEN`, with fallback to `SHARED_SONGS_ADMIN_URL` and `SHARED_SONGS_ADMIN_TOKEN`.
- Runtime admin token lookup prefers `UNVERIFIED_SONGS_ADMIN_TOKEN`, with fallback to `SHARED_SONGS_ADMIN_TOKEN`.
- Runtime KV lookup accepts `UNVERIFIED_SONGS_KV`, but still uses `SHARED_SONGS_KV` as the configured binding.
- Worker routes serve both new `/unverified-*` paths and legacy `/shared-*` aliases.
- Cloudflare Pages function files keep legacy `/shared-*` wrappers that re-export the new unverified handlers.
- API/storage compatibility still accepts legacy `externalSongId` and `verifiedAt` fields.
- The legacy package script `shared-song:upsert-fixture` still delegates to `unverified-song:upsert-fixture`.

## Cleanup preconditions

Do this cleanup only after the migration has been deployed and observed.

- GitHub repository secrets `UNVERIFIED_SONGS_ADMIN_URL` and `UNVERIFIED_SONGS_ADMIN_TOKEN` are set.
- Cloudflare runtime secrets `UNVERIFIED_SONGS_ADMIN_TOKEN` and `ADMIN_PANEL_PASSWORD` are set for the deployed target.
- Promotion workflow `.github/workflows/promote-shared-songs-to-unverified.yml` has run successfully with the new secret names.
- Import workflow `.github/workflows/import-songs.yml` has run successfully with the new secret names.
- Logs show no expected traffic to legacy `/shared-song`, `/shared-songs`, `/shared-songs-admin`, `/admin/shared-song`, or `/admin/shared-songs` routes.
- Local and E2E scripts use `pnpm unverified-song:upsert-fixture` instead of the legacy script alias.
- Existing KV records either contain `sharedSongId` and `validatedAt`, or the team accepts dropping compatibility for older record shapes.

## Cleanup checklist

### Remove legacy route aliases

- Delete Cloudflare Pages wrapper files:
  - `functions/shared-song.ts`
  - `functions/shared-songs.ts`
  - `functions/shared-songs-admin.ts`
  - `functions/admin/shared-song.ts`
  - `functions/admin/shared-songs.ts`
- Remove legacy route branches from `worker/index.ts`:
  - `/shared-song`
  - `/shared-songs`
  - `/shared-songs-admin`
  - `/admin/shared-song`
  - `/admin/shared-songs`

### Remove old secret fallbacks

- Remove `SHARED_SONGS_ADMIN_TOKEN` from `functions/unverified-songs-env.ts`.
- Remove `SHARED_SONGS_ADMIN_URL` and `SHARED_SONGS_ADMIN_TOKEN` fallbacks from `scripts/cicd/unverified-songs-admin-client.ts`.
- Remove fallback references from `.github/workflows/promote-shared-songs-to-unverified.yml`.
- Remove fallback references from `.github/workflows/import-songs.yml`.
- Remove old-token fallback logic from test helpers where present.

### Remove old API/storage field compatibility

- Stop emitting legacy `externalSongId` in public API responses.
- Remove `externalSongId` input compatibility from admin upsert/update paths.
- Remove `externalSongId` normalization fallback from `functions/unverified-songs-store.ts`.
- Remove legacy `verifiedAt` input compatibility once all records use `validatedAt`.
- Update tests to assert only `sharedSongId` and `validatedAt`.

### Keep legacy KV storage names

Do not rename these unless a separate KV storage migration is explicitly approved.

- KV binding in `wrangler.jsonc`: `SHARED_SONGS_KV`
- KV record prefix: `shared-song:`
- KV index key: `shared-songs-index`

### Remove legacy script and docs references

- Remove `shared-song:upsert-fixture` from `package.json`.
- Update `docs/unverified-songs-flow.md` to remove migration fallback notes that are no longer true.
- Review historical plan docs only if they are meant to represent current implementation rather than historical planning.

## Validation after cleanup

Run the focused checks first:

```bash
pnpm test functions/unverified-songs-store.test.ts functions/admin/unverified-songs.test.ts functions/admin/unverified-song.test.ts src/routes/sing-a-song/song-selection/hooks/use-unverified-songs-search.test.ts src/modules/songs/utils/shared-song-import-processing.test.ts
pnpm type-check
```

Run E2E coverage if route wrappers or admin browser behavior changed:

```bash
pnpm playwright test tests/admin-unverified-songs.spec.ts tests/unverified-songs-cloudflare-gameplay.spec.ts tests/unverified-songs-cloudflare-storage-edit.spec.ts
```

Manual endpoint smoke checks should use only new paths:

```bash
curl -s "https://<production-origin>/unverified-songs?query=<query>"
curl -s "https://<production-origin>/unverified-song?id=<sharedSongId>"
```

## Rollback note

This cleanup should be safe to revert because KV storage names remain unchanged. If an old client or workflow still depends on legacy names, revert the cleanup PR and keep the new secrets in place.
