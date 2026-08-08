/** The invite link for a room: the current origin (so a dev/preview host keeps working) plus the
 * route and `?room=<code>`. The fallback keeps this callable while pre-rendering, where there is no
 * `location` — only the origin comes from it, and every caller renders again in the browser. */
export default function buildRoomLink(route: string, code: string) {
  const linkObject = new URL(global.location?.href ?? 'https://allkaraoke.party/');
  linkObject.pathname = `${import.meta.env.BASE_URL}${route}`;
  linkObject.search = `room=${code}`;

  return linkObject.href;
}
