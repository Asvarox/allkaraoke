import posthog from 'posthog-js';
import { useRef, useState } from 'react';

import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { checkRoomExists } from '~/modules/online/client/online-client';
import { ONLINE_ROOM_CODE_LENGTH } from '~/modules/online/protocol/consts';
import { isRemoteMicGameCode } from '~/modules/remote-mic/network/game-code';

/** Room code entry, verified against the server before `onConfirm`, so a typo is caught upfront. */
export default function useJoinRoomCode(initialCode: string, onConfirm: (roomCode: string) => void) {
  const [code, setCode] = useState(initialCode);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<{
    element: HTMLInputElement | null;
    triggerValidationError: (message: string) => void;
  } | null>(null);
  const navigate = useSmoothNavigate();

  const submit = async () => {
    if (checking) return;
    const roomCode = code.trim().toLowerCase();
    if (roomCode.length < ONLINE_ROOM_CODE_LENGTH) {
      inputRef.current?.triggerValidationError('Enter the room code');
      return;
    }
    // A game code for the phone mic, typed here by mistake — no online room can have it
    if (isRemoteMicGameCode(roomCode)) {
      posthog.capture('online_join_redirected_to_remote_mic', { transport: 'r' });
      navigate('remote-mic/', { room: roomCode });
      return;
    }
    setChecking(true);
    // The code says which backend to ask — this browser's own flag has no say in a room it joins.
    const exists = await checkRoomExists(roomCode);
    setChecking(false);
    if (!exists) {
      inputRef.current?.triggerValidationError('This room does not exist');
      return;
    }
    onConfirm(roomCode);
  };

  return { code, setCode, checking, submit, inputRef };
}
