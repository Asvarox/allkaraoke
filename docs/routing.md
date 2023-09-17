# Routing

## How it works on Github Pages

Solution is based on [this repo](https://github.com/rafgraph/spa-github-pages). In short:

1. A custom 404 page (`public/404.html`) is implemented
2. When a user opens an unknown URL, the custom 404 page redirects back to main page (`index.html`) with the URL in the query params
3. In `index.html`, a custom JS code "decodes" the query params and replaced the path with the original one

This approach allows usage of regular Router (rather than HashRouter or similar).
