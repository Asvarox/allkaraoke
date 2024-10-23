# Pre-rendering ("SSG")

## Why pre-rendering?
The main reason for pre-rendering is to improve SEO and perceived load times. Additionally, since the app is a SPA,
the hard-refresh was handled by redirecting from 404.html to index.html. This also caused browsers/search engines to
think that there are links to non-existent pages on the site, possibly reducing its SEO score. With pre-rendering and
putting params of the URL the query string this is now mitigated.

## Solution
During build, all known paths (kept in `src/routePaths.ts`) are passed to 
[vite-plugin-html-prerender](https://github.com/saeedafzal/vite-plugin-html-prerender), which then uses Puppeteer to render 
the pages and save them in appropriate folder structure. The project is copied and modified so it
1. Handles custom `basePath` (needed for branch deployment)
2. Uses Playwright rather than Puppeteer for rendering (so there's no need to double-install the browsers)

## Alternative solutions considered
### Next.js
Next.js is a popular framework for React that supports pre-rendering out of the box. However, the project is already
relying on Vite. Next.js is also a much bigger framework, and it would be an overkill to use it just for pre-rendering.
The impact on Developer Experience is not clear (dev server build times, etc.) - other experiences with Next.js
shown that it is slower than Vite in that regard.

### Remix
Remix has a plugin for Vite to implement SSR. This project is meant to be hosted on GitHub Pages, so it must be all
static, which is not something Remix supports. Technically, Puppeteer could be used to prerender pages rendered through
Remix, but it would be a lot of work to rewrite the app to use Remix in the first place. Could be considered in the
future especially if the support for SSG from Remix is added.

### Vike
Vike is a Vite plugin, similar to Remix, but one that supports pre-rendering though not being as mature. It was the
most likely option, but it has proven difficult to use ViewTransition API with its routing.
