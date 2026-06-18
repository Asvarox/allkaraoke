# Playwright GitHub Actions Config Input Design

## Goal

Change the reusable GitHub Action that runs Playwright so callers pass a Playwright config filename instead of an arbitrary package script string.

## Current State

The reusable action at `.github/templates/run-playwright/action.yml` currently accepts `packagescript` and executes it inside the Playwright container with `npx`. That allows callers to inject arbitrary command fragments such as `test-ct -u`, which makes the action contract loose and mixes command construction with workflow configuration.

## Design

The reusable action should own Playwright invocation directly. It will accept:

- `config`: full Playwright config filename, such as `playwright.config.ts` or `playwright-ct.config.mts`
- `project`: existing Playwright project name input
- `shard` and `shardTotal`: existing shard inputs
- `updateSnapshots`: new boolean-like string input, defaulting to `false`

The action will always run:

```text
npx playwright test -c <config>
```

It will append `-u` only when `updateSnapshots` is enabled, then append the shard and project arguments.

## Workflow Changes

- E2E jobs should pass `config: playwright.config.ts`
- Component test jobs should pass `config: playwright-ct.config.mts`
- The non-master component test path should set `updateSnapshots: 'true'`

## Expected Outcome

The Playwright runner action becomes narrower and more predictable, while workflows still retain the behavior they need for E2E runs, component tests, and snapshot updates.
