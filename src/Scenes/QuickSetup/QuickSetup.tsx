import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import MenuWithLogo from 'Elements/MenuWithLogo';

interface Props {
    // file?: string;
}

function QuickSetup(props: Props) {
    const navigate = useSmoothNavigate();
    const onFinish = (pref: (typeof MicSetupPreference)[number]) => {
        navigate('/');
    };

    return (
        <MenuWithLogo>
            <SelectInputView onFinish={onFinish} closeButtonText="Sing a song" smooth={false} />
        </MenuWithLogo>
    );
}

export default QuickSetup;
