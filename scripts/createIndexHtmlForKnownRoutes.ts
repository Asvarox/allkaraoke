import fs from 'node:fs';
import routePaths from '../src/routePaths';

/**
 * This is basically a poor-man's SSG. It creates the folder structure for the known routes
 * and copies the index.html to each of them. This is needed because otherwise the refresh
 * will rely on 404.html to redirect to index.html, which makes the search engines not index
 * the page.
 */
Object.values(routePaths).forEach((route) => {
  console.log(`Creating directory build/${route}`);
  fs.mkdirSync(`build/${route}`, { recursive: true });
  console.log(`Copying build/index.html to build/${route}/index.html`);
  fs.copyFileSync('build/index.html', `build/${route}/index.html`);
});
