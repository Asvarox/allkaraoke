type Env = unknown;

export const onRequest: PagesFunction<Env> = async (context) => {
  // get body string from context.request.body
  const bodyString = await context.request.text();
  const [data] = bodyString.split('\n');
  const { dsn } = JSON.parse(data);
  const dsnUrl = new URL(dsn);

  const url = `https://sentry.io/api${dsnUrl.pathname}/envelope/`;

  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-sentry-envelope',
    },
    body: bodyString,
  });
};
