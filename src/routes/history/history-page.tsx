import { useState } from 'react';
import { Helmet } from 'react-helmet';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { HistoryPageView } from './history-page-view';
import { usePlayHistory } from './use-play-history';

function HistoryPage() {
  const navigate = useSmoothNavigate();
  const { groups, loading } = usePlayHistory();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { register } = useKeyboardNav({ onBackspace: () => navigate('menu/') });

  return (
    <>
      <Helmet>
        <title>History | AllKaraoke.Party</title>
      </Helmet>
      <HistoryPageView
        groups={groups}
        loading={loading}
        expandedKey={expandedKey}
        onToggleEntry={(entryKey) => setExpandedKey((currentKey) => (currentKey === entryKey ? null : entryKey))}
        getEntryInteractionProps={(entryKey, onToggle) => register(entryKey, onToggle)}
        backButtonProps={register('back', () => navigate('menu/'))}
        onBack={() => navigate('menu/')}
      />
    </>
  );
}

export default HistoryPage;
