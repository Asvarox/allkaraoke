import useSmoothNavigate from 'hooks/useSmoothNavigate';
import ExcludeLanguagesView from './ExcludeLanguagesView';

interface Props {}

function ExcludeLanguages(props: Props) {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('/');

  return <ExcludeLanguagesView onClose={goBack} closeText="Return to Main Menu" />;
}

export default ExcludeLanguages;
