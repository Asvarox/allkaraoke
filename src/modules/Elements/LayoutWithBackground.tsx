import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { colorSets } from 'modules/GameEngine/Drawing/styles';
import React, { createContext, useContext, useEffect, useState } from 'react';
import eurovisionBg from './eurovisionbg.svg';

export type backgroundTheme = 'regular' | 'christmas' | 'eurovision';

export const BackgroundContext = createContext({
  visible: true,
  theme: 'regular' as backgroundTheme,
  setVisibility: (visible: boolean): void => undefined,
  setTheme: (theme: backgroundTheme): void => undefined,
});

export const useBackground = (shouldBeVisible: boolean, theme: backgroundTheme = 'regular') => {
  const { setVisibility, setTheme } = useContext(BackgroundContext);

  useEffect(() => {
    setVisibility(shouldBeVisible);
  }, [shouldBeVisible, setVisibility]);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);
};

export default function LayoutWithBackgroundProvider({ children }: React.PropsWithChildren) {
  const [visible, setVisible] = useState(true);
  const [theme, setTheme] = useState<backgroundTheme>('regular');

  return (
    <BackgroundContext.Provider value={{ visible, setVisibility: setVisible, setTheme, theme }}>
      {visible && <Background bgtheme={theme}>{theme === 'eurovision' && <EurovisionTheme />}</Background>}
      {children}
    </BackgroundContext.Provider>
  );
}

export const EurovisionTheme = () => (
  <>
    <EscBar disableAnimation={global.location?.href.includes('/remote-mic')} />
  </>
);

const EscBar = styled.div<{ disableAnimation: boolean }>`
  transform: scale(1, 4);

  background-image: url(${eurovisionBg});
  background-size: 100% 50%;
  height: 100%;
  ${(props) =>
    !props.disableAnimation &&
    css`
      animation: escGradient 46s linear infinite;
      flex: 1;
    `}

  @keyframes escGradient {
    0% {
      background-position: 0% 800%;
    }
    100% {
      background-position: 0% 0%;
    }
  }
`;
export const BackgroundStatic = styled.div<{ bgtheme: backgroundTheme }>`
  background-color: white;
  ${(props) =>
    props.bgtheme === 'christmas'
      ? css`
          background-image: linear-gradient(
            -45deg,
            ${colorSets.christmasGreen.text},
            ${colorSets.christmasGreen.stroke},
            ${colorSets.christmasRed.stroke},
            ${colorSets.christmasRed.stroke}
          );
          background-size: 400% 400%;
        `
      : props.bgtheme === 'eurovision'
        ? css`
            display: flex;
          `
        : css`
            background-image: linear-gradient(
              -45deg,
              ${colorSets.red.stroke},
              ${colorSets.blue.text},
              ${colorSets.blue.stroke},
              ${colorSets.red.stroke}
            );
            background-size: 400% 400%;
          `}

  width: 100%;
  height: 100%;
`;

const Background = styled(BackgroundStatic)`
  z-index: -1;
  top: 0;
  position: fixed;

  ${(props) => (props.theme.graphicSetting === 'high' ? 'animation: gradient 15s ease infinite' : '')};
  ${(props) => (props.theme.graphicSetting === 'low' ? 'background-position: 100% 50%' : '')};

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;
