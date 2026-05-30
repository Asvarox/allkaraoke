import events from '~/modules/game-events/game-events';
import { useEventListener } from '~/modules/game-events/hooks';

export default function usePermissions() {
  const [permissions] = useEventListener(events.remoteMicPermissionsSet, true) ?? ['write'];

  return permissions;
}
