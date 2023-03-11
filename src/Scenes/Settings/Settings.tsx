import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { nextValue, Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import {
    FpsCount,
    FPSCountSetting,
    GraphicSetting,
    GraphicsLevel,
    useSettingValue,
} from 'Scenes/Settings/SettingsState';
import { useLocation } from 'wouter';

interface Props {}

function Settings(props: Props) {
    const [, navigate] = useLocation();
    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    const [graphicLevel, setGraphicLevel] = useSettingValue(GraphicSetting);
    const [fpsCount, setFpsCount] = useSettingValue(FPSCountSetting);

    return (
        <LayoutWithBackground>
            <MenuContainer>
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
                <MenuButton {...register('go back', goBack)} data-test="back-button">
                    Return To Main Menu
                </MenuButton>
            </MenuContainer>
        </LayoutWithBackground>
    );
}

export default Settings;
