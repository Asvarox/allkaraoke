import MenuWithLogo from 'Elements/MenuWithLogo';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import useSmoothNavigate from 'hooks/useSmoothNavigate';

interface Props {
    // file?: string;
}

function SelectInput(props: Props) {
    const navigate = useSmoothNavigate();

    return (
        <MenuWithLogo>
            <SelectInputView onFinish={() => navigate('/')} closeButtonText={'Go to main menu'} />
        </MenuWithLogo>
    );
}
export default SelectInput;
