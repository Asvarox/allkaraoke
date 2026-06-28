const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';
const POSTHOG_RETRY_DELAY_MS = 30_000;
const POSTHOG_RETRY_COUNT = 8;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
module.exports.requestPostHog = async (url, options = {}) => {
  const requestUrl = `${API_URL}/api/projects/${PROJECT_ID}/${url}`;

  for (let attempt = 1; attempt <= POSTHOG_RETRY_COUNT + 1; attempt += 1) {
    try {
      console.log('requesting PostHog', requestUrl, { attempt, options });
      const response = await fetch(requestUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${process.env.VITE_APP_POSTHOG_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (attempt <= POSTHOG_RETRY_COUNT) {
          console.warn(`PostHog request failed with status ${response.status}. Retrying in ${POSTHOG_RETRY_DELAY_MS / 1000}s.`);
          await wait(POSTHOG_RETRY_DELAY_MS);
          continue;
        }

        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (attempt <= POSTHOG_RETRY_COUNT) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`PostHog request failed with error "${message}". Retrying in ${POSTHOG_RETRY_DELAY_MS / 1000}s.`);
        await wait(POSTHOG_RETRY_DELAY_MS);
        continue;
      }

      throw error;
    }
  }
};
