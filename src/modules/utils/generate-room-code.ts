/** Random lowercase a-z code, the shape both online rooms and remote-mic game codes use — short
 * enough to read out loud across a room and to type on a phone. */
export default function generateRoomCode(length: number) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  }
  return code;
}
