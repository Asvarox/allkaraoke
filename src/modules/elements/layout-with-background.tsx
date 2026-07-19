import React, { CSSProperties, useEffect, useState } from 'react';
import { twc, TwcComponentProps } from 'react-twc';

import { BackgroundContext as BackgroundContext1 } from '~/modules/elements/background-context';
import { EurovisionBackground } from '~/modules/elements/background/eurovision';
import Snow from '~/modules/elements/snow';
import { colorSets } from '~/modules/game-engine/drawing/styles';
import isE2E from '~/modules/utils/is-e2-e';
import { GraphicSetting, useSettingValue } from '~/routes/settings/settings-state';

import eurovisionBg from './eurovisionbg.svg';

export type backgroundTheme = 'regular' | 'christmas' | 'eurovision' | 'halloween';

// During E2E/screenshot runs the animated gradient is non-deterministic and, being a viewport-sized
// `fixed` element, doesn't cover the area below the fold in `fullPage` captures. Painting a flat
// blue-ish colour on <body> instead keeps screenshots stable and fully covered.
const SCREENSHOT_BACKGROUND = '#1a5dab';

const themeStyles: Partial<Record<backgroundTheme, CSSProperties>> & { default: CSSProperties } = {
  default: {
    backgroundImage: 'linear-gradient(to bottom right, #2575cf, #1a5dab, #144a8a, #2575cf)',
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
  const screenshotMode = isE2E();

  useEffect(() => {
    if (!screenshotMode) return;
    const previous = document.body.style.background;
    document.body.style.background = SCREENSHOT_BACKGROUND;
    return () => {
      document.body.style.background = previous;
    };
  }, [screenshotMode]);

  return (
    <BackgroundContext1 value={{ visible, setVisibility: setVisible, setTheme, theme }}>
      {visible && !screenshotMode && (
        <div className="fixed inset-0 z-[-1] h-screen w-screen">
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

const EscBar = twc.div`h-full scale-y-[4] [background-size:100%_50%] data-[animate=true]:flex-1 data-[animate=true]:animate-[escGradient_46s_linear_infinite]`;

export const EurovisionTheme = () => (
  <EscBar
    data-animate={!global.location?.href.includes('/remote-mic')}
    style={{ backgroundImage: `url(${eurovisionBg})` }}
  />
);

export const BackgroundStatic = twc.div`h-full w-full bg-white`;

type BGProps = TwcComponentProps<'div'> & {
  'data-theme': backgroundTheme;
  'data-graphic-level': ReturnType<typeof GraphicSetting.get>;
};

export const Background = twc(BackgroundStatic)((props: BGProps) => [
  'h-screen w-screen',
  props['data-theme'] === 'halloween' ? 'bg-black' : '',
  props['data-graphic-level'] === 'high' ? 'animate-gradient' : '',
]);
