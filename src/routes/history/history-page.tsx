import { Fragment, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Menu } from '~/modules/elements/akui/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { PlayEntryCard } from './play-entry-card';
import { usePlayHistory } from './use-play-history';

function HistoryPage() {
  const navigate = useSmoothNavigate();
  const { groups, loading } = usePlayHistory();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { register } = useKeyboardNav({ onBackspace: () => navigate('menu/') });

  const isEmpty = !loading && groups.length === 0;

  return (
    <MenuWithLogo data-test="history-page">
      <Helmet>
        <title>History | AllKaraoke.Party</title>
      </Helmet>
      <Menu.Header>History</Menu.Header>
      {loading && <Menu.HelpText>Loading…</Menu.HelpText>}
      {isEmpty && <Menu.HelpText data-test="history-empty-state">No songs sung yet — go sing something!</Menu.HelpText>}
      {groups.map((group) => (
        <Fragment key={group.label}>
          <Menu.SubHeader>{group.label}</Menu.SubHeader>
          {group.entries.map((entry) => {
            // Unique key per play: song hash + ISO timestamp
            const entryKey = `history-entry-${entry.songKey}-${entry.date}`;
            const isExpanded = expandedKey === entryKey;

            return (
              <PlayEntryCard
                key={entryKey}
                entry={entry}
                isExpanded={isExpanded}
                {...register(entryKey, () => setExpandedKey(isExpanded ? null : entryKey))}
              />
            );
          })}
        </Fragment>
      ))}
      <Menu.Divider />
      <Menu.Button {...register('back', () => navigate('menu/'))}>Back</Menu.Button>
    </MenuWithLogo>
  );
}

export default HistoryPage;
