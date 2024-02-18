import NoPrerender from 'Elements/NoPrerender';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';
import ExcludeLanguagesView from './ExcludeLanguagesView';

interface Props {}

function ExcludeLanguages(props: Props) {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');

  return (
    <>
      <Helmet>
        <title>Select Languages | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <NoPrerender>
        <ExcludeLanguagesView onClose={goBack} closeText="Return to Main Menu" />
      </NoPrerender>
    </>
  );
}

export default ExcludeLanguages;
