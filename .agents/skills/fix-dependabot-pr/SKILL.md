---
name: fix-dependabot-pr
description: Use when asked to fix, unblock, finish or assess a Dependabot pull request in this repo (a PR link or number for a `dependabot/*` branch). Diagnoses why it failed, completes the update, syncs with master, verifies, and reports on the PR with a clear "Safe to merge" verdict.
---

# Fix a Dependabot PR

Goal: get the update merged with the libraries used "as the book" says. Make the fewest changes possible, with no workarounds. If that can't be done safely, say so on the PR instead.

## 1. Gather context

- Read the PR: `gh pr view <n> --json title,body,headRefName,mergeable,files,statusCheckRollup,comments`.
- Read every non-bot comment. Earlier fix attempts often report there what was tried and why it failed. Don't repeat a failed approach.
- Read the failing CI logs (`gh pr checks <n>`, then `gh run view <id> --log-failed`).
- Look for duplicate or older Dependabot PRs for the same package: `gh pr list --search "<package>" --state open`. Note them as superseded.

## 2. Make sure the update is complete

Every package and tool tied to the bumped one must move together. Check:

- **Types and library.** If `@types/x` is bumped, bump `x` too, and the other way round.
- **Runtime versions.** If `@types/node` changes major, the Node version in `.nvmrc` must match. Every CI job reads it through `.github/templates/setup-node`.
- **Package families and peers.** Packages released together (for example `vite`/`vitest`/`@vitest/*`, `storybook`/`@storybook/*`, `wrangler`/`@cloudflare/*`, `playwright`/`@playwright/test`) must stay in sync. Check `pnpm peers check` before and after, and fix new unmet peers only.
- **Dependabot groups.** `.github/dependabot.yml` defines groups. A related package outside the group may still need bumping.

## 3. Sync with master

- Check out the PR branch (`headRefName`) and run `git merge origin/master`. Don't rebase, so the Dependabot history stays intact.
- `pnpm-lock.yaml` conflicts: take master's copy, then run `pnpm install` to regenerate it. Never hand-edit the lockfile.
- Screenshot conflicts (`*-linux.png`, `*-ci.png`): take master's copy. CI re-renders and commits them.
- Other conflicts: resolve by hand, keeping both sides' intent.

## 4. Fix or stop

Fix it when the changes are small and low-risk: version alignment, renamed props or functions (even across many call sites), adjusted TypeScript types, config-key renames, or a runtime version bump.

Stop, and don't push code, when the update needs a refactor that changes runtime behaviour in a significant or risky way. Examples: a replaced API with different semantics, a reworked data flow, or dropped features that need substitutes. Judge by complexity and risk, not by line count. The PR must stay easy to understand.

Never "fix" an update with any of these:

- pinning or downgrading the package instead of upgrading;
- `overrides`/`resolutions` hacks;
- `// @ts-ignore`, `any` casts or lint suppressions;
- skipped tests.

If an override can't be avoided, explain it in `docs/dependency-updates-report.md`.

## 5. Verify

Run these from the repo root:

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm knip
```

Run `pnpm test:browser` when the update touches Vitest browser mode, Playwright or canvas code. CI is the final check: e2e, visual regression and storybook screenshots only run there.

## 6. Push and report

- Commit with a normal message and push to the PR's own branch (`git push origin HEAD:<headRefName>`).
- Wait for CI to finish before giving a verdict (`gh pr checks <n> --watch`).
- Post one comment on the PR. If you already posted one in this session, edit it with `gh api -X PATCH repos/<owner>/<repo>/issues/comments/<id> -F body=@file` instead of adding another.

The comment's first line must be the verdict header, exactly one of:

```markdown
# Safe to merge: Yes

# Safe to merge: No
```

Follow the header with a one-line reason (for example "All CI checks pass", or "Needs refactor of X"), then these sections:

- **Why it was stuck.** The root cause, or causes.
- **What changed.** Each change and why it was needed. If nothing was pushed, say so.
- **Verification.** The commands run locally and their results, plus the CI result.
- **Notes.** Superseded PRs, harmless leftovers, and follow-ups.
- **What's needed** (No verdict only). The concrete changes the upgrade requires, with the files or APIs involved, so someone can pick it up.

End the comment with the Claude Code attribution line.
