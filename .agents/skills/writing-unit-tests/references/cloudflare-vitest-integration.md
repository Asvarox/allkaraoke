---
title: Write your first test
description: Write tests against Workers using Vitest
image: https://developers.cloudflare.com/dev-products-preview.png
---

> Documentation Index  
> Fetch the complete documentation index at: https://developers.cloudflare.com/workers/llms.txt  
> Use this file to discover all available pages before exploring further.

[Skip to content](#%5Ftop) 

# Write your first test

This guide will instruct you through getting started with the `@cloudflare/vitest-pool-workers` package. For more complex examples of testing using `@cloudflare/vitest-pool-workers`, refer to [Recipes](https://developers.cloudflare.com/workers/testing/vitest-integration/recipes/).

## Prerequisites

First, make sure that:

* Your [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) is set to `2022-10-31` or later.
* Your Worker using the ES modules format (if not, refer to the [migrate to the ES modules format](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/) guide).
* Vitest and `@cloudflare/vitest-pool-workers` are installed in your project as dev dependencies  
 npm  yarn  pnpm  bun  
```  
npm i -D vitest@^4.1.0 @cloudflare/vitest-pool-workers  
```  
```  
yarn add -D vitest@^4.1.0 @cloudflare/vitest-pool-workers  
```  
```  
pnpm add -D vitest@^4.1.0 @cloudflare/vitest-pool-workers  
```  
```  
bun add -d vitest@^4.1.0 @cloudflare/vitest-pool-workers  
```  
Note  
The `@cloudflare/vitest-pool-workers` package requires Vitest 4.1 or later.

## Define Vitest configuration

In your `vitest.config.ts` file, use the `cloudflareTest()` plugin to configure the Workers Vitest integration.

You can use your Worker configuration from your [Wrangler config file](https://developers.cloudflare.com/workers/wrangler/configuration/) by specifying it with `wrangler.configPath`.

vitest.config.ts

```

import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

import { defineConfig } from "vitest/config";


export default defineConfig({

  plugins: [

    cloudflareTest({

      wrangler: { configPath: "./wrangler.jsonc" },

    }),

  ],

});


```

You can also override or define additional configuration using the `miniflare` key. This takes precedence over values set in via your Wrangler config.

For example, this configuration would add a KV namespace `TEST_NAMESPACE` that was only accessed and modified in tests.

JavaScript

```

export default defineConfig({

  plugins: [

    cloudflareTest({

      wrangler: { configPath: "./wrangler.jsonc" },

      miniflare: {

        kvNamespaces: ["TEST_NAMESPACE"],

      },

    }),

  ],

});


```

For a full list of available Miniflare options, refer to the [Miniflare WorkersOptions API documentation ↗](https://github.com/cloudflare/workers-sdk/tree/main/packages/miniflare#interface-workeroptions).

For a full list of available configuration options, refer to [Configuration](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/).

## Define types

If you are not using Typescript, you can skip this section.

First make sure you have run [wrangler types](https://developers.cloudflare.com/workers/wrangler/commands/), which generates [types for the Cloudflare Workers runtime](https://developers.cloudflare.com/workers/languages/typescript/) and an `Env` type based on your Worker's bindings.

Then add a `tsconfig.json` in your tests folder and add `"@cloudflare/vitest-pool-workers"` to your types array to define types for `cloudflare:test`. You should also add the output of `wrangler types` to the `include` array so that the types for the Cloudflare Workers runtime are available.

Example test/tsconfig.json

test/tsconfig.json

```

{

  "extends": "../tsconfig.json",

  "compilerOptions": {

    "moduleResolution": "bundler",

    "types": [

      "@cloudflare/vitest-pool-workers/types", // provides `cloudflare:test` and `cloudflare:workers` types

    ],

  },

  "include": [

    "./**/*.ts",

    "../src/worker-configuration.d.ts", // output of `wrangler types`

  ],

}


```

## Writing tests

We will use this simple Worker as an example. It returns a 404 response for the `/404` path and `"Hello World!"` for all other paths.

* [  JavaScript ](#tab-panel-11571)
* [  TypeScript ](#tab-panel-11572)

src/index.js

```

export default {

  async fetch(request, env, ctx) {

    if (pathname === "/404") {

      return new Response("Not found", { status: 404 });

    }

    return new Response("Hello World!");

  },

};


```

src/index.ts

```

export default {

  async fetch(request, env, ctx): Promise<Response> {

    if (pathname === "/404") {

      return new Response("Not found", { status: 404 });

    }

    return new Response("Hello World!");

  },

} satisfies ExportedHandler<Env>;


```

### Unit tests

By importing the Worker we can write a unit test for its `fetch` handler.

* [  JavaScript ](#tab-panel-11575)
* [  TypeScript ](#tab-panel-11576)

test/unit.spec.js

```

import { env } from "cloudflare:workers";

import {

  createExecutionContext,

  waitOnExecutionContext,

} from "cloudflare:test";

import { describe, it, expect } from "vitest";

// Import your worker so you can unit test it

import worker from "../src";


// For now, you'll need to do something like this to get a correctly-typed

// `Request` to pass to `worker.fetch()`.

const IncomingRequest = Request;


describe("Hello World worker", () => {

  it("responds with Hello World!", async () => {

    const request = new IncomingRequest("http://example.com/404");

    // Create an empty context to pass to `worker.fetch()`

    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);

    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions

    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(404);

    expect(await response.text()).toBe("Not found");

  });

});


```

test/unit.spec.ts

```

import { env } from "cloudflare:workers";

import {

  createExecutionContext,

  waitOnExecutionContext,

} from "cloudflare:test";

import { describe, it, expect } from "vitest";

// Import your worker so you can unit test it

import worker from "../src";


// For now, you'll need to do something like this to get a correctly-typed

// `Request` to pass to `worker.fetch()`.

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;


describe("Hello World worker", () => {

  it("responds with Hello World!", async () => {

    const request = new IncomingRequest("http://example.com/404");

    // Create an empty context to pass to `worker.fetch()`

    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);

    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions

    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(404);

    expect(await response.text()).toBe("Not found");

  });

});


```

### Integration tests

You can use the `exports` object provided by `cloudflare:workers` to write an integration test. `exports.default.fetch()` calls the default export handler defined in the main Worker.

* [  JavaScript ](#tab-panel-11573)
* [  TypeScript ](#tab-panel-11574)

test/integration.spec.js

```

import { exports } from "cloudflare:workers";

import { describe, it, expect } from "vitest";


describe("Hello World worker", () => {

  it("responds with not found and proper status for /404", async () => {

    const response = await exports.default.fetch("http://example.com/404");

    expect(response.status).toBe(404);

    expect(await response.text()).toBe("Not found");

  });

});


```

test/integration.spec.ts

```

import { exports } from "cloudflare:workers";

import { describe, it, expect } from "vitest";


describe("Hello World worker", () => {

  it("responds with not found and proper status for /404", async () => {

    const response = await exports.default.fetch("http://example.com/404");

    expect(response.status).toBe(404);

    expect(await response.text()).toBe("Not found");

  });

});


```

When using `exports.default.fetch()` for integration tests, your Worker code runs in the same context as the test runner. This means you can use global mocks to control your Worker, but also means your Worker uses the subtly different module resolution behavior provided by Vite. Usually this is not a problem, but to run your Worker in a fresh environment that is as close to production as possible, you can use an auxiliary Worker. Refer to [this example ↗](https://github.com/cloudflare/workers-sdk/blob/main/fixtures/vitest-pool-workers-examples/basics-integration-auxiliary/vitest.config.ts) for how to set up integration tests using auxiliary Workers. However, using auxiliary Workers comes with [limitations](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/#workerspooloptions) that you should be aware of.

## Related resources

* For more complex examples of testing using `@cloudflare/vitest-pool-workers`, refer to [Recipes](https://developers.cloudflare.com/workers/testing/vitest-integration/recipes/).
* [Configuration API reference](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/)
* [Test APIs reference](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/)

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"item":{"@id":"/directory/","name":"Directory"}},{"@type":"ListItem","position":2,"item":{"@id":"/workers/","name":"Workers"}},{"@type":"ListItem","position":3,"item":{"@id":"/workers/testing/","name":"Testing"}},{"@type":"ListItem","position":4,"item":{"@id":"/workers/testing/vitest-integration/","name":"Vitest integration"}},{"@type":"ListItem","position":5,"item":{"@id":"/workers/testing/vitest-integration/write-your-first-test/","name":"Write your first test"}}]}
```
