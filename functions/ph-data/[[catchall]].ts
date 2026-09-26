const API_HOST = 'eu.i.posthog.com';
const ASSET_HOST = 'eu-assets.i.posthog.com';

type Env = unknown;
type params = 'catchall';

type Context = Parameters<typeof onRequest>[0];

async function handleRequest(context: Context) {
  const url = new URL(context.request.url);
  // use catchall parameter to make sure the function path is not passed to the API
  const pathname = (context.params.catchall as string[]).join('/');
  const search = url.search;
  const pathWithParams = pathname + search;

  if (pathname.startsWith('/static/')) {
    return retrieveStatic(context, pathWithParams);
  } else {
    return forwardRequest(context, pathWithParams);
  }
}

async function retrieveStatic({ request, waitUntil }: Context, pathname: string) {
  let response = await caches.default.match(request);
  if (!response) {
    response = await fetch(`https://${ASSET_HOST}/${pathname}`);
    waitUntil(caches.default.put(request, response.clone()));
  }
  return response;
}

async function forwardRequest({ request }: Context, pathWithSearch: string) {
  const originRequest = new Request(request);
  originRequest.headers.delete('cookie');
  return await fetch(`https://${API_HOST}/${pathWithSearch}`, originRequest);
}

export const onRequest: PagesFunction<Env, params> = (context) => {
  return handleRequest(context);
};
