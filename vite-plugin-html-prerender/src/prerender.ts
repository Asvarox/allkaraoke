import { minify } from 'html-minifier';
import path from 'path';
import type { Plugin, ResolvedConfig } from 'vite';
import Renderer from './renderer';
import Server from './server';
import { HtmlPrerenderOptions } from './types';

const port = 0;
const defaultSelector = '#root';

const htmlPrerender = (options: HtmlPrerenderOptions): Plugin => {
  let config: ResolvedConfig | null = null;
  return {
    configResolved: (resolvedConfig) => {
      config = resolvedConfig;
    },
    name: 'vite-plugin-html-prerender',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      await emitRendered(options, config);
    },
  };
};

const emitRendered = async (options: HtmlPrerenderOptions, config: ResolvedConfig | null): Promise<void> => {
  const server = new Server(port);
  const renderer = new Renderer();

  const basePath = config?.base && path.isAbsolute(config.base) ? config.base : '/';

  await server
    .init(options.staticDir, basePath)
    // for some reason initializing the renderer here results in quicker build times than if it was started before the build
    .then(async () => renderer.init())
    .then(async () => {
      console.log('[vite-plugin-html-prerender] Base path for routes:', basePath);
      return await Promise.all(
        options.routes.map(async (route) => {
          const label = `[vite-plugin-html-prerender] Pre-rendering route: ${route}`;
          console.time(label);

          const renderedRoute = await renderer.renderRoute(
            basePath,
            route,
            server.runningPort,
            options.selector || defaultSelector,
          );
          console.timeEnd(label);
          return renderedRoute;
        }),
      );
    })
    .then((renderedRoutes) => {
      if (options.minify) {
        console.log('[vite-plugin-html-prerender] Minifying rendered HTML...');
        renderedRoutes.forEach((route) => {
          route.html = minify(route.html, options.minify);
        });
      }
      return renderedRoutes;
    })
    .then(async (renderedRoutes) => {
      console.log('[vite-plugin-html-prerender] Saving pre-rendered routes to output...');
      for (const renderedRoute of renderedRoutes) {
        await renderer.saveToFile(options.staticDir, renderedRoute);
      }
    })
    .then(async () => {
      await renderer.destroy();
      await server.destroy();
      console.log('[vite-plugin-html-prerender] Pre-rendering routes completed.');
    })
    .catch(async (e) => {
      await renderer.destroy();
      await server.destroy();
      console.error('[vite-plugin-html-prerender] Failed to prerender routes:', e);
    });
};

export default htmlPrerender;
