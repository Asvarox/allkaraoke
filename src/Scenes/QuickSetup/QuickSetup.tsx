import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuContainer } from 'Elements/Menu';
import RecommendedBrowsers from 'Elements/RecommendedBrowsers';
import Logo from 'Elements/Logo';
import styled from '@emotion/styled';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import { navigate } from 'hooks/useHashLocation';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';

interface Props {
    // file?: string;
}

function QuickSetup(props: Props) {
    const onFinish = (pref: typeof MicSetupPreference[number]) => {
        navigate('/');
    };

    return (
        <LayoutWithBackground>
            <GithubRibbon />
            <Container>
                <Logo />
                <RecommendedBrowsers />
                <MenuContainer>
                    <SelectInputView onFinish={onFinish} closeButtonText="Sing a song" />
                </MenuContainer>
            </Container>
        </LayoutWithBackground>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export default QuickSetup;
