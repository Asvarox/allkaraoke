import { Fragment, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import MenuWithLogo from '~/modules/Elements/MenuWithLogo';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import useSmoothNavigate from '~/modules/hooks/useSmoothNavigate';
import { PlayEntryCard } from './PlayEntryCard';
import { usePlayHistory } from './usePlayHistory';

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
            const entryKey = `${entry.songKey}-${entry.date}`;
            const isExpanded = expandedKey === entryKey;

            return (
              <PlayEntryCard
                key={entryKey}
                entry={entry}
                isExpanded={isExpanded}
                {...register(entryKey, () => setExpandedKey(isExpanded ? null : entryKey))}
                data-test="history-entry"
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
