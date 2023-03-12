import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { useLocation } from 'wouter';
import ExcludeLanguagesView from './ExcludeLanguagesView';

interface Props {}

function ExcludeLanguages(props: Props) {
    const [, navigate] = useLocation();
    const goBack = () => navigate('/');

    return (
        <LayoutWithBackground>
            <ExcludeLanguagesView onClose={goBack} closeText="Return to Main Menu" />
        </LayoutWithBackground>
    );
}

export default ExcludeLanguages;
