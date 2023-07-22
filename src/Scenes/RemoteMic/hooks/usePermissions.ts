import events from 'GameEvents/GameEvents';
import { useEventListener } from 'GameEvents/hooks';

export default function usePermissions() {
    const [permissions] = useEventListener(events.remoteMicPermissionsSet) ?? ['write'];

    return permissions;
}
