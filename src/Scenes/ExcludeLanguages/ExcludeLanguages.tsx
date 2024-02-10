import NoPrerender from 'Elements/NoPrerender';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import ExcludeLanguagesView from './ExcludeLanguagesView';

interface Props {}

function ExcludeLanguages(props: Props) {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');

  return (
    <NoPrerender>
      <ExcludeLanguagesView onClose={goBack} closeText="Return to Main Menu" />
    </NoPrerender>
  );
}

export default ExcludeLanguages;
