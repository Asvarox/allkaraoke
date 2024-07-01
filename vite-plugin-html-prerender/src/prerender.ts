import { minify } from 'html-minifier';
import path from 'path';
import type { Plugin, ResolvedConfig } from 'vite';
import Renderer from './renderer';
import Server from './server';
import { HtmlPrerenderOptions, RenderedRoute } from './types';

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
    .then(async () => {
      console.log('\n[vite-plugin-html-prerender] Starting headless browser...');
      return await renderer.init();
    })
    .then(async () => {
      const renderedRoutes: RenderedRoute[] = [];
      console.log('[vite-plugin-html-prerender] Base path for routes:', basePath);
      for (let route of options.routes) {
        console.log('[vite-plugin-html-prerender] Pre-rendering route:', route);
        renderedRoutes.push(
          await renderer.renderRoute(basePath, route, server.runningPort, options.selector || defaultSelector),
        );
      }
      return renderedRoutes;
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
      for (let renderedRoute of renderedRoutes) {
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
