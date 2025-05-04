import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { EurovisionBackground } from 'modules/Elements/Background/Eurovision';
import { BackgroundContext as BackgroundContext1 } from 'modules/Elements/BackgroundContext';
import Snow from 'modules/Elements/Snow';
import { colorSets } from 'modules/GameEngine/Drawing/styles';
import React, { CSSProperties, useState } from 'react';
import { twc, TwcComponentProps } from 'react-twc';
import { GraphicSetting, useSettingValue } from 'routes/Settings/SettingsState';
import eurovisionBg from './eurovisionbg.svg';

export type backgroundTheme = 'regular' | 'christmas' | 'eurovision' | 'halloween';

const themeStyles: Partial<Record<backgroundTheme, CSSProperties>> & { default: CSSProperties } = {
  default: {
    backgroundImage: `linear-gradient(-45deg, ${colorSets.red.stroke}, ${colorSets.blue.text}, ${colorSets.blue.stroke}, ${colorSets.red.stroke})`,
    backgroundSize: '400% 400%',
  },
  christmas: {
    backgroundImage: `linear-gradient(-45deg, ${colorSets.christmasGreen.text}, ${colorSets.christmasGreen.stroke}, #05144a, #05144a)`,
    // backgroundImage: `linear-gradient(-45deg, #0f1d52, #0f1d52, #05144a, #05144a)`,
    backgroundSize: '400% 400%',
  },
  halloween: {
    background: 'black',
  },
};

export default function LayoutWithBackgroundProvider({ children }: React.PropsWithChildren) {
  const [visible, setVisible] = useState(true);
  const [theme, setTheme] = useState<backgroundTheme>('regular');
  const [graphicLevel] = useSettingValue(GraphicSetting);

  return (
    <BackgroundContext1 value={{ visible, setVisibility: setVisible, setTheme, theme }}>
      {visible && (
        <div className="fixed z-[-1]">
          {theme === 'eurovision' && <EurovisionBackground />}
          {theme === 'regular' && (
            <Background
              data-theme={theme}
              data-graphic-level={graphicLevel}
              style={themeStyles[theme] ?? themeStyles.default}
            />
          )}
          {theme === 'christmas' && (
            <Background
              data-theme={theme}
              data-graphic-level={graphicLevel}
              style={themeStyles[theme] ?? themeStyles.default}>
              <Snow />
            </Background>
          )}
        </div>
      )}
      {children}
    </BackgroundContext1>
  );
}

const escBarAnimation = css`
  animation: escGradient 46s linear infinite;
  flex: 1;

  @keyframes escGradient {
    0% {
      background-position: 0% 800%;
    }
    100% {
      background-position: 0% 0%;
    }
  }
`;

const EscBar = styled.div`
  transform: scale(1, 4);

  background-image: url(${eurovisionBg});
  background-size: 100% 50%;
  height: 100%;

  &[data-animate='true'] {
    ${escBarAnimation};
  }
`;

export const EurovisionTheme = () => <EscBar data-animate={!global.location?.href.includes('/remote-mic')} />;

export const BackgroundStatic = twc.div`bg-white w-full h-full`;

type BGProps = TwcComponentProps<'div'> & {
  'data-theme': backgroundTheme;
  'data-graphic-level': ReturnType<typeof GraphicSetting.get>;
};

export const Background = twc(BackgroundStatic)((props: BGProps) => [
  'w-screen h-screen',
  props['data-theme'] === 'halloween' ? 'bg-black' : '',
  props['data-graphic-level'] === 'high' ? 'animate-gradient' : '',
]);
