# Remote Mic Sentry Filter Design

## Goal

Stop reporting expected remote-mic RPC connection failures to Sentry without changing runtime behavior in the browser.

## Decision

Filter the known remote-mic RPC error message patterns in the existing global Sentry `ignoreErrors` configuration.

## Rationale

- The errors are already constructed as stable string messages in the RPC client.
- `ignoreErrors` is already configured in the app bootstrap, so this is the narrowest change.
- The RPC client should continue rejecting promises normally so app behavior and console behavior remain unchanged.

## Scope

- Ignore `Transport disconnected during RPC: ...`
- Ignore `RPC timeout: ...`
- Ignore `Not connected (calling ...)`

## Out of Scope

- Swallowing these rejections in the UI
- Changing transport, retry, or reconnect behavior
- Muting unrelated RPC failures
