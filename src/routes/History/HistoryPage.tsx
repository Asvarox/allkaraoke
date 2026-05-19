import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { twc } from 'react-twc';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import useSmoothNavigate from '~/modules/hooks/useSmoothNavigate';
import LayoutGame from '~/routes/LayoutGame';
import { PlayEntryCard } from './PlayEntryCard';
import { usePlayHistory } from './usePlayHistory';

function HistoryPage() {
  useBackground(true);
  const navigate = useSmoothNavigate();
  const { groups, loading } = usePlayHistory();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { register } = useKeyboardNav({ onBackspace: () => navigate('menu/') });

  const isEmpty = !loading && groups.length === 0;

  return (
    <LayoutGame>
      <Helmet>
        <title>History | AllKaraoke.Party</title>
      </Helmet>
      <Container data-test="history-page">
        <Header>History</Header>
        {loading && <Message>Loading…</Message>}
        {isEmpty && <Message data-test="history-empty-state">No songs sung yet — go sing something!</Message>}
        {groups.map((group) => (
          <section key={group.label}>
            <DateHeader>{group.label}</DateHeader>
            {group.entries.map((entry) => {
              // Unique key per play: song hash + ISO timestamp
              const entryKey = `${entry.songKey}-${entry.date}`;
              const isExpanded = expandedKey === entryKey;

              return (
                <PlayEntryCard
                  key={entryKey}
                  entry={entry}
                  isExpanded={isExpanded}
                  data-test="history-entry"
                  {...register(entryKey, () => setExpandedKey(isExpanded ? null : entryKey))}
                />
              );
            })}
          </section>
        ))}
      </Container>
    </LayoutGame>
  );
}

const Container = twc.div`flex h-full flex-col gap-2 overflow-y-auto p-8`;
const Header = twc.h1`typography mb-4 text-3xl font-bold`;
const DateHeader = twc.h2`typography mt-6 mb-2 text-lg font-semibold opacity-70 first:mt-0`;
const Message = twc.p`typography opacity-70`;

export default HistoryPage;
