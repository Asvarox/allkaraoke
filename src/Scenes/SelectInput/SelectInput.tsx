import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuContainer } from 'Elements/Menu';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { useLocation } from 'wouter';

interface Props {
    // file?: string;
}

function SelectInput(props: Props) {
    const [, navigate] = useLocation();
    return (
        <LayoutWithBackground>
            <MenuContainer>
                <SelectInputView onFinish={() => navigate('/')} closeButtonText={'Go to main menu'} />
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default SelectInput;
