import { ReactNode } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Box from '~/modules/elements/akui/primitives/box';

interface Props {
  title: string;
  /** What the board covers — the heading has no room to say it. */
  subtitle: ReactNode;
  children: ReactNode;
  'data-test'?: string;
}

/**
 * The surface the post-game boards sit on: a titled panel with a scrolling list of
 * {@link ScoreboardRow}s. The local and global boards share it so the pair reads as one thing split
 * in two rather than as two unrelated widgets.
 *
 * `Box` centres its children; this stacks them full width instead, and spells out its own surface —
 * `Box`'s `bg-black/30` is invisible against this screen, and the border is what reads as an edge.
 *
 * Height is taken from whatever the parent leaves rather than capped at a magic number: the panel
 * grows to its rows and then stops, and the list inside it scrolls. The post-game step has no room
 * to spare, and a fixed cap there pushed the button that moves on off the bottom of the screen.
 */
function ScoreboardPanel({ title, subtitle, children, 'data-test': dataTest }: Props) {
  return (
    <Box
      className="max-h-full min-h-0 w-full items-stretch gap-1.5 border border-white/10 bg-black/50 p-2 lg:max-w-[25rem] lg:flex-1"
      data-test={dataTest}>
      <Menu.SubHeader as="h2" className="text-active text-left text-base font-bold lg:text-lg">
        {title}
      </Menu.SubHeader>
      <Menu.HelpText className="text-left text-xs opacity-70 lg:text-sm">{subtitle}</Menu.HelpText>
      {/* `min-h-0` so this is what shrinks when the panel is capped, rather than overflowing it */}
      <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">{children}</div>
    </Box>
  );
}

export default ScoreboardPanel;
