import events from '~/modules/GameEvents/GameEvents';
import { useEventListener } from '~/modules/GameEvents/hooks';

export default function usePermissions() {
  const [permissions] = useEventListener(events.remoteMicPermissionsSet, true) ?? ['write'];

  return permissions;
}
