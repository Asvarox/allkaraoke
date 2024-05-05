import { requestPostHog } from './utils.cjs';

/** @typedef {Array<[string, number]>} Response ["event", "count"] */

(async () => {
  /** @type {Response} */
  const response = await requestPostHog(`query`, {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
            select event, count() \`count\`
            from events
            where events.created_at > now() - INTERVAL 60 MINUTE
              and event IN ('songStarted', 'songEnded', '$autocapture')
            group by event
        `,
      },
    }),
  });
  response.results.forEach(([event, count]) => {
    if (count === 0) throw new Error(`::error:: No \`${event}\` events in the last 60 minutes`);
    console.log(`::notice:: \`${event}\`: ${count}`);
  });
})();
