import { createContext, useContext, useEffect } from 'react';
import { backgroundTheme } from '~/modules/Elements/LayoutWithBackground';

export const BackgroundContext = createContext({
  visible: true,
  theme: 'regular' as backgroundTheme,
  setVisibility: (_visible: boolean): void => undefined,
  setTheme: (_theme: backgroundTheme): void => undefined,
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
