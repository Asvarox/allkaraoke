# Shared Songs Flow (Cloudflare KV + PostHog + CI)

This document explains how the Shared Songs pipeline works end-to-end, and how to set up KV namespaces and secrets for local, preview, and production environments.

## 1) What the flow does

Shared songs are submitted as PostHog events, validated and normalized by CI scripts, and then stored in Cloudflare KV.

At runtime, the app:

- Searches unverified shared songs via `GET /shared-songs`
- Loads a selected shared song via `GET /shared-song?id=<externalSongId>`
- Shows shared songs as a fallback group in Song Selection when regular search results are low

## 2) Main components

- Storage contract and KV index: `functions/sharedSongsStore.ts`
- Public search endpoint: `functions/shared-songs.ts`
- Public fetch-by-id endpoint: `functions/shared-song.ts`
- Admin mutating endpoint (token-protected): `functions/shared-songs-admin.ts`
- CI sync script (PostHog -> KV): `scripts/cicd/githubActionSyncSharedSongs.ts`
- Admin API client for scripts: `scripts/cicd/sharedSongsAdminClient.ts`
- Fixture upsert script for local testing: `scripts/cicd/upsertSharedSongFixture.ts`

## 3) Data model stored in KV

Each shared song record contains:

- `externalSongId`
- `songId`
- `songTxt`
- `artist`
- `title`
- `language`
- `videoId`
- `verifiedAt`
- `firstSeenAt`
- `lastSeenAt`
- `sourceUserId`
- `sourceEventAt`

Notes:

- Upsert semantics are full replacement for the record.
- Record keys are stored under `shared-song:<externalSongId>`.
- A separate index key `shared-songs-index` stores the list of external IDs for listing/filtering.

## 4) End-to-end lifecycle

### 4.1 Intake

Users trigger PostHog events:

- `share-song` (contains song payload)
- `unshare-song` (contains song id)

### 4.2 CI sync and validation

Workflow: `.github/workflows/sync-shared-songs.yml`

The sync job:

1. Queries PostHog events in a time window
2. Validates parsed song structure and required metadata
3. Normalizes ESC suffix in titles when applicable
4. Validates lyric timing against YouTube duration (with fallback cap)
5. Calls admin endpoint:
   - `POST /shared-songs-admin` to upsert
   - `DELETE /shared-songs-admin?id=<id>` to remove

### 4.3 Runtime usage in app

- Search API: `src/modules/Songs/sharedSongs/api.ts` -> `/shared-songs`
- Song selection merge logic: `src/routes/SingASong/SongSelection/Hooks/useSongList.ts`
- Shared songs are presented in group: `Unverified`

## 5) KV namespace setup (prod + preview)

The project expects this binding in `wrangler.jsonc`:

- `binding = "SHARED_SONGS_KV"`
- `id = "<production namespace id>"`
- `preview_id = "<preview namespace id>"`

### 5.1 Create production namespace

Run:

```bash
pnpm wrangler kv namespace create SHARED_SONGS_KV
```

Copy the returned namespace `id` into `wrangler.jsonc` under `kv_namespaces` as `id`.

### 5.2 Create preview namespace

Run:

```bash
pnpm wrangler kv namespace create SHARED_SONGS_KV --preview
```

Copy the returned namespace `id` into `wrangler.jsonc` as `preview_id`.

### 5.3 Verify bindings

Run:

```bash
pnpm wrangler kv namespace list
```

Confirm both production and preview namespaces exist and match `wrangler.jsonc`.

## 6) Secrets management

### 6.1 Cloudflare runtime secret (admin endpoint auth)

Secret name:

- `SHARED_SONGS_ADMIN_TOKEN`

Set it for deployed runtime.

If deployment is managed as a Worker:

```bash
pnpm wrangler secret put SHARED_SONGS_ADMIN_TOKEN
```

If deployment is managed as a Pages project:

```bash
pnpm wrangler pages secret put SHARED_SONGS_ADMIN_TOKEN --project-name allkaraoke-party
```

Guidelines:

- Do not commit this value to repo files.
- Rotate periodically and immediately if leaked.
- Keep local and CI values aligned with the environment being targeted (`gh secret set SHARED_SONGS_ADMIN_TOKEN`)

### 6.2 Local development secret

Use `.dev.vars` (gitignored), for example:

```env
SHARED_SONGS_ADMIN_TOKEN=your-local-token
```

For script-driven local fixture upserts, defaults are in `.env`:

- `SHARED_SONGS_ADMIN_URL=http://127.0.0.1:8788`
- `SHARED_SONGS_ADMIN_TOKEN=local-shared-songs-admin-token`

You can override with `.env.local`.

### 6.3 GitHub Actions secrets

Shared songs workflows rely on these repo secrets:

- `SHARED_SONGS_ADMIN_URL`
- `SHARED_SONGS_ADMIN_TOKEN`
- `POSTHOG_PAT_KEY`

Additional import workflow secrets you likely already have:

- `GH_PAT_REPOS_WORKFLOW`
- `DEFAULT_IMPORT_USER_IDS`

Where used:

- `.github/workflows/sync-shared-songs.yml`
- `.github/workflows/import-songs.yml`

## 7) Bootstrapping checklist for a new environment

1. Create KV namespace for production and preview.
2. Put resulting IDs into `wrangler.jsonc` (`id` and `preview_id`).
3. Set runtime secret `SHARED_SONGS_ADMIN_TOKEN` for Cloudflare.
4. Set GitHub repository secrets (`SHARED_SONGS_ADMIN_URL`, `SHARED_SONGS_ADMIN_TOKEN`, `POSTHOG_PAT_KEY`).
5. Run local fixture upsert to validate:

```bash
pnpm shared-song:upsert-fixture
```

Optional: override the admin base URL directly from CLI (useful when test target differs from local default):

```bash
pnpm shared-song:upsert-fixture -- --base-url http://127.0.0.1:8788
pnpm shared-song:upsert-fixture -- --base-url https://localhost:3010
```

6. Verify APIs manually:

```bash
curl -s "http://127.0.0.1:8788/shared-songs?query=Cloudflare%20Shared%20Unique%20Song"
curl -s "http://127.0.0.1:8788/shared-song?id=shared-cloudflare-e2e-song"
```

## 8) Operational notes

- `GET /shared-songs` requires `query` and supports `limit` (capped at 25).
- `GET /shared-song` requires `id`.
- `POST /shared-songs-admin` validates payload shape and upserts.
- `DELETE /shared-songs-admin?id=<id>` removes song and index entry.
- If `SHARED_SONGS_KV` binding is missing, endpoints return 500 with configuration error.

## 9) Troubleshooting

- `401 Unauthorized` on admin endpoint:
  - Check `x-shared-songs-admin-token` header value against runtime secret.
- `Shared songs storage is not configured`:
  - Verify `SHARED_SONGS_KV` binding and namespace IDs in `wrangler.jsonc`.
- CI sync not writing data:
  - Verify GitHub secrets and target admin URL.
  - Check workflow logs in `.github/workflows/sync-shared-songs.yml`.
- Local fixture script fails env checks:
  - Ensure `.env` or `.env.local` has `SHARED_SONGS_ADMIN_TOKEN`.
  - Ensure admin URL is available either from `.env`/`.env.local` (`SHARED_SONGS_ADMIN_URL`) or via `--base-url`.
