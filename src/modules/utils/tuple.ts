// https://gist.github.com/jcalz/381562d282ebaa9b41217d1b31e2c211?permalink_comment_id=2618337#gistcomment-2618337
export default function tuple<T extends [void] | object>(val: T): T {
  return val;
}
