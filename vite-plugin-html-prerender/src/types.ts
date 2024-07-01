import { Options } from 'html-minifier';

export interface HtmlPrerenderOptions {
  /**
   * The output path of `vite build`.
   */
  staticDir: string;

  /**
   * Routes to render.
   */
  routes: Array<string>;

  /**
   * Minify the html output.
   * Optional.
   */
  minify?: Options;

  /**
   * The query selector for the root element to wait for.
   * Defaults to "#root".
   * Optional.
   */
  selector?: string;
}

export type RenderedRoute = {
  route: string;
  html: string;
};
