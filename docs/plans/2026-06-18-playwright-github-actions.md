# Playwright GitHub Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the reusable Playwright GitHub Action input that currently accepts a package script with a config filename and a separate snapshot-update flag.

**Architecture:** Keep command construction inside the reusable action so workflows declare intent instead of shell fragments. Update workflow callers to pass config filenames and preserve the existing snapshot-update behavior through a dedicated boolean input.

**Tech Stack:** GitHub Actions composite actions, Playwright, YAML

---

### Task 1: Update the reusable Playwright runner action

**Files:**

- Modify: `.github/templates/run-playwright/action.yml`

**Step 1: Replace the action inputs**

Remove `packagescript` and add `config` plus `updateSnapshots` with a default of `false`.

**Step 2: Replace arbitrary command execution**

Make the action run `npx playwright test -c <config>` and conditionally append `-u` when `updateSnapshots` is enabled.

**Step 3: Keep existing shard and project support**

Preserve `--shard` and `--project` arguments so the existing matrix behavior is unchanged.

**Step 4: Update artifact naming**

Use the config filename instead of the old package script input in artifact names.

### Task 2: Update workflow callers

**Files:**

- Modify: `.github/workflows/ci-improvement.yml`

**Step 1: Update the E2E workflow call**

Pass `config: 'playwright.config.ts'` to the reusable action.

**Step 2: Update the master component-test workflow call**

Pass `config: 'playwright-ct.config.mts'` with default `updateSnapshots`.

**Step 3: Update the PR component-test workflow call**

Pass `config: 'playwright-ct.config.mts'` and `updateSnapshots: 'true'`.

### Task 3: Verify the migration

**Files:**

- Check: `.github/templates/run-playwright/action.yml`
- Check: `.github/workflows/ci-improvement.yml`

**Step 1: Search for stale input usage**

Run: `rg -n "packagescript|updateSnapshots|playwright-ct.config.mts|playwright.config.ts" .github`

Expected: no remaining `packagescript` references in active workflow/action files, and the new config-based calls present.

**Step 2: Review the resulting YAML**

Run: `sed -n '1,220p' .github/templates/run-playwright/action.yml`
Run: `sed -n '1,140p' .github/workflows/ci-improvement.yml`

Expected: the reusable action accepts `config` and `updateSnapshots`, and all callers use the new contract.
