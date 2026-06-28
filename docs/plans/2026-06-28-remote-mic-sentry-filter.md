# Remote Mic Sentry Filter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stop sending expected remote-mic RPC disconnect and timeout errors to Sentry while leaving app runtime behavior unchanged.

**Architecture:** Extend the existing global Sentry `ignoreErrors` list with regex patterns that match the remote-mic RPC client error messages. Keep the RPC client and UI call sites unchanged so promise rejection behavior stays the same.

**Tech Stack:** React, TypeScript, Sentry browser SDK

---

### Task 1: Add remote-mic RPC Sentry filters

**Files:**

- Modify: `src/modules/utils/sentry-ignore-errors.ts`
- Check: `src/modules/remote-mic/network/rpc/rpc-client.ts`

**Step 1: Confirm the emitted error strings**

Run: `sed -n '1,220p' src/modules/remote-mic/network/rpc/rpc-client.ts`
Expected: the file contains `Not connected (calling ...)`, `RPC timeout: ...`, and `Transport disconnected during RPC: ...`.

**Step 2: Add regex ignore entries**

Update `src/modules/utils/sentry-ignore-errors.ts` with regex patterns covering the three expected remote-mic RPC message forms.

**Step 3: Verify the filter is wired globally**

Run: `sed -n '1,120p' src/main.tsx`
Expected: Sentry `init` includes `ignoreErrors: sentryIgnoreErrors`.

**Step 4: Run a focused project verification**

Run: `pnpm type-check`
Expected: no new type errors caused by the filter change.
