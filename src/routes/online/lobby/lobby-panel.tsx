// oxlint-disable react-refresh/only-export-components
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import { cn } from '~/utils/cn';
import { twx } from '~/utils/twx';

/** The surface of a lobby column and of the card between them: `dialogSurface` with the menu's own
 * radius and padding. `h-full min-h-0` fills the grid cell without letting content stretch it. */
export const lobbyPanelSurface = cn(dialogSurface, 'h-full min-h-0 rounded-none p-4 sm:p-6 md:rounded-xl');

/** A column of the lobby that sits beside the song card — chat, standings. Inside the card they go
 * without it. */
export const LobbyPanel = twx.div(() => [lobbyPanelSurface, 'flex flex-col gap-3']);
