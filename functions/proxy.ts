type Env = unknown;

export const onRequest: PagesFunction<Env> = async (context) => {
  const hostAllowList = ['ultrastar-es.org', 'usdb.animux.de'];
  try {
    const url = new URL(context.request.url as string);
    const targetUrl = new URL(url.searchParams.get('url'));
    if (!hostAllowList.includes(targetUrl.hostname)) {
      throw new Error('Invalid hostname');
    }
    /// pass through the request using fetch
    const originalResponse = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: {
        ...(context.request.headers ?? {}),
      },
      /// only include body when it is not a GET/HEAD request
      ...(['get', 'head'].includes(context.request.method.toLowerCase()) ? {} : { body: context.request.body }),
    });

    const response = new Response(originalResponse.body, {
      status: originalResponse.status,
      statusText: originalResponse.statusText,
      headers: originalResponse.headers,
    });

    response.headers.set('Content-Security-Policy', "default-src 'self' allkaraoke.party *.allkaraoke.party localhost");

    return response;
  } catch (e) {
    console.error(e);
    return new Response();
  }
};
