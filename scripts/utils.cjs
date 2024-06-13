const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';

/**
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
module.exports.requestPostHog = async (url, options = {}) => {
  console.log('requesting PostHog', `${API_URL}/api/projects/${PROJECT_ID}/${url}`, options);
  const response = await fetch(`${API_URL}/api/projects/${PROJECT_ID}/${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${process.env.VITE_APP_POSTHOG_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}: ${await response.text()}`);
  }

  return response.json();
};