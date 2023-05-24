import { MenuButton } from 'Elements/Menu';
import { nextValue, Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import {
    FpsCount,
    FPSCountSetting,
    GraphicSetting,
    GraphicsLevel,
    MobilePhoneModeSetting,
    useSettingValue,
} from 'Scenes/Settings/SettingsState';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import MenuWithLogo from 'Elements/MenuWithLogo';
import { ReactNode, useEffect, useState } from 'react';
import CameraManager from 'Camera/CameraManager';
import { CircularProgress } from '@mui/material';

interface Props {}

function Settings(props: Props) {
    const navigate = useSmoothNavigate();
    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    const [graphicLevel, setGraphicLevel] = useSettingValue(GraphicSetting);
    const [fpsCount, setFpsCount] = useSettingValue(FPSCountSetting);
    const [mobilePhoneMode, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

    const [camera, setCamera] = useState<null | boolean>(CameraManager.getPermissionStatus());
    useEffect(() => {
        return CameraManager.addListener((status) => {
            setCamera(status);
        });
    }, []);

    const [isRequestInProgress, setIsRequestInProgress] = useState(false);
    const enableCamera = () => {
        setIsRequestInProgress(true);
        CameraManager.requestPermissions().then(() => setIsRequestInProgress(false));
    };

    let cameraValue: ReactNode = 'Disabled';
    if (isRequestInProgress) cameraValue = <CircularProgress size="0.9em" />;
    else if (camera === null) cameraValue = 'Click to enable';
    else if (camera) cameraValue = 'Enabled';

    return (
        <MenuWithLogo>
            <h1>Settings</h1>
            <h2>Graphics</h2>
            <Switcher
                {...register('graphics', () => setGraphicLevel(nextValue(GraphicsLevel, graphicLevel)))}
                label="Graphics"
                value={graphicLevel.toUpperCase()}
                data-test="graphics-level"
            />
            <Switcher
                {...register('fpsCount', () => setFpsCount(nextValue(FpsCount, fpsCount)))}
                label="FPS Count"
                value={fpsCount}
                data-test="fps-count-level"
            />
            <hr />
            <Switcher
                {...register('camera', () => (camera ? CameraManager.disable() : enableCamera()))}
                label="Enable camera mode"
                value={cameraValue}
                data-test="camera-access"
                info="Take pictures during the game and show them afterwards. The images are not stored anywhere."
            />
            <hr />
            <Switcher
                {...register('mobilePhoneMode', () => setMobilePhoneMode(!mobilePhoneMode))}
                label="Mobile Phone Mode"
                value={mobilePhoneMode ? 'Yes' : 'No'}
                data-test="mobile-phone-mode"
                info="Adjust the game to a smaller screen. Disables option to sing in duets."
            />
            <hr />
            <MenuButton
                {...register('manage songs', () => navigate('/manage-songs'))}
                data-test="manage-songs-button"
                size="small">
                Manage Songs
            </MenuButton>
            <MenuButton {...register('go back', goBack)} data-test="back-button">
                Return To Main Menu
            </MenuButton>
        </MenuWithLogo>
    );
}

export default Settings;
