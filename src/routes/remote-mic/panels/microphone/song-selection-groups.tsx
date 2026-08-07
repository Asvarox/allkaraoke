import { useEffect, useRef } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { ScrollableRow } from '~/modules/elements/akui/selector';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { RemoteSongGroupEntry } from '~/modules/remote-mic/network/client/subscriptions';
import scrollIntoView from '~/modules/utils/scroll-into-view';
import vibrate from '~/modules/utils/vibrate';

interface Props {
  groups: RemoteSongGroupEntry[];
}

/**
 * The song groups row, mirrored from the screen — including both of its highlight states: the full
 * one for a group scrolled into view, and the subtle one for the group holding the selected song
 * (only when that group isn't already in view). Tapping one jumps the TV's list to that group.
 */
export default function SongSelectionGroups({ groups }: Props) {
  if (groups.length === 0) return null;

  // Only the FIRST group in view is scrolled to, so a viewport spanning several groups doesn't
  // fight itself over which one to centre — same rule the on-screen nav row follows.
  const firstVisible = groups.findIndex((group) => group.visible);

  return (
    <div data-test="remote-song-groups" className="shrink-0">
      <ScrollableRow className="items-center">
        {groups.map((group, index) => (
          <GroupItem key={group.name} group={group} isFirstVisible={index === firstVisible} />
        ))}
      </ScrollableRow>
    </div>
  );
}

function GroupItem({ group, isFirstVisible }: { group: RemoteSongGroupEntry; isFirstVisible: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFirstVisible && ref.current) {
      scrollIntoView(ref.current, { inline: 'center', block: 'nearest' });
    }
  }, [isFirstVisible]);

  const subtleFocused = group.containsSelectedSong && !group.visible;

  return (
    <Button
      ref={ref}
      size="mini"
      focused={group.visible || subtleFocused}
      subtleFocused={subtleFocused}
      onClick={() => {
        vibrate(100);
        void serverRpc.songs.scrollToGroup(group.name);
      }}
      data-active={group.visible}
      data-test={`group-navigation-${group.name}`}
      className="text-md min-w-10 shrink-0 animate-none whitespace-nowrap">
      {group.label}
    </Button>
  );
}
