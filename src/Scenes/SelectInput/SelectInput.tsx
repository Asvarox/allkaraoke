import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuContainer } from 'Elements/Menu';
import SelectInputContent from './SelectInputContent';

interface Props {
    // file?: string;
}

function SelectInput(props: Props) {
    return (
        <LayoutWithBackground>
            <MenuContainer>
                <SelectInputContent />
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default SelectInput;
