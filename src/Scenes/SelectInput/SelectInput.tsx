import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuContainer } from 'Elements/Menu';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { navigate } from 'hooks/useHashLocation';

interface Props {
    // file?: string;
}

function SelectInput(props: Props) {
    return (
        <LayoutWithBackground>
            <MenuContainer>
                <SelectInputView onFinish={() => navigate('/')} closeButtonText={'Go to main menu'} />
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default SelectInput;
