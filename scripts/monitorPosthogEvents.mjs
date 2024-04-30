const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';

/**
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
const makeRequest = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${process.env.VITE_APP_POSTHOG_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

// ["event", "count"]
/** @typedef {Array<[string, number]>} Response */
(async () => {
  /** @type {Response} */
  const response = await makeRequest(`/api/projects/${PROJECT_ID}/query`, {
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
