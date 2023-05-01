import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import MenuWithLogo from 'Elements/MenuWithLogo';
import SuggestMobileMode from 'Scenes/QuickSetup/SuggestMobileMode';
import { useMemo } from 'react';

interface Props {
    // file?: string;
}

function QuickSetup(props: Props) {
    const navigate = useSmoothNavigate();
    const onFinish = (pref: (typeof MicSetupPreference)[number]) => {
        navigate('/');
    };

    const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
    const isMobile = useMemo(
        () =>
            window.matchMedia(
                'only screen and (((max-width: 500px) and (max-aspect-ratio: 9/16)) or ((max-height: 500px) and (min-aspect-ratio: 16/9)))',
            ).matches,
        [],
    );

    return (
        <>
            {mobilePhoneMode === null && isMobile ? (
                <SuggestMobileMode />
            ) : (
                <MenuWithLogo>
                    <SelectInputView onFinish={onFinish} closeButtonText="Sing a song" smooth={false} />
                </MenuWithLogo>
            )}
        </>
    );
}

export default QuickSetup;
