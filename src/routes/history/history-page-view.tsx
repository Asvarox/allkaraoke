import { ComponentProps, Fragment } from 'react';
import { Menu } from '~/modules/elements/akui/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { HistoryPageSkeleton } from './history-page-skeleton';
import { PlayEntryCard, type PlayEntryCardInteractionProps } from './play-entry-card';
import { PlayHistoryGroup } from './use-play-history';

interface HistoryPageViewProps {
  groups: PlayHistoryGroup[];
  loading: boolean;
  expandedKey?: string | null;
  onToggleEntry?: (entryKey: string) => void;
  getEntryInteractionProps?: (entryKey: string, onToggle: () => void) => Partial<PlayEntryCardInteractionProps>;
  backButtonProps?: ComponentProps<typeof Menu.Button>;
  onBack?: () => void;
}

export function HistoryPageView({
  groups,
  loading,
  expandedKey = null,
  onToggleEntry,
  getEntryInteractionProps,
  backButtonProps,
  onBack,
}: HistoryPageViewProps) {
  const isEmpty = !loading && groups.length === 0;

  return (
    <MenuWithLogo data-test="history-page">
      <Menu.Header>History</Menu.Header>
      {loading && <HistoryPageSkeleton />}
      {isEmpty && <Menu.HelpText data-test="history-empty-state">No songs sung yet — go sing something!</Menu.HelpText>}
      {!loading &&
        groups.map((group) => (
          <Fragment key={group.label}>
            <Menu.SubHeader>{group.label}</Menu.SubHeader>
            {group.entries.map((entry) => {
              const entryKey = `history-entry-${entry.songKey}-${entry.date}`;
              const isExpanded = expandedKey === entryKey;
              const handleToggle = () => onToggleEntry?.(entryKey);

              return (
                <PlayEntryCard
                  key={entryKey}
                  entry={entry}
                  isExpanded={isExpanded}
                  onClick={handleToggle}
                  {...getEntryInteractionProps?.(entryKey, handleToggle)}
                />
              );
            })}
          </Fragment>
        ))}
      <Menu.Divider />
      <Menu.Button onClick={onBack} {...backButtonProps}>
        Back
      </Menu.Button>
    </MenuWithLogo>
  );
}
