import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useEffect, useState } from 'react';
import { nextValue, Switcher } from 'Scenes/Game/SongSelection/Switcher';
import { GraphicSetting, GraphicsLevel } from 'Scenes/Settings/SettingsState';

interface Props {}

function Settings(props: Props) {
    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    const [graphicLevel, setGraphicLevel] = useState(GraphicSetting.get());
    useEffect(() => {
        return GraphicSetting.addListener((newValue) => {
            setGraphicLevel(newValue);
        });
    }, [setGraphicLevel]);

    const onGraphicsLevelChange = () => GraphicSetting.set(nextValue(GraphicsLevel, graphicLevel));

    return (
        <LayoutWithBackground>
            <MenuContainer>
                <h1>Settings</h1>
                <h2>Graphics</h2>
                <Switcher
                    {...register('graphics', onGraphicsLevelChange)}
                    label="Graphics"
                    value={graphicLevel.toUpperCase()}
                    data-test="graphics-level"
                />
                <MenuButton {...register('go back', goBack)} data-test="back-button">
                    Return To Main Menu
                </MenuButton>
            </MenuContainer>
        </LayoutWithBackground>
    );
}

export default Settings;
