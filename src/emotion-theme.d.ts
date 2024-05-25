import { GraphicsLevel } from 'routes/Settings/SettingsState';
import { ValuesType } from 'utility-types';

declare module '@emotion/react' {
  export interface Theme {
    graphicSetting: ValuesType<typeof GraphicsLevel>;
  }
}

declare module '@mui/material/styles' {
  export interface Theme {
    graphicSetting: ValuesType<typeof GraphicsLevel>;
  }
  interface ThemeOptions {
    graphicSetting: ValuesType<typeof GraphicsLevel>;
  }
}
