import { backgroundTheme } from 'modules/Elements/LayoutWithBackground';
import tinycolor from 'tinycolor2';

export const christmasGreenFillBase = tinycolor('rgb(52, 166, 95)');
export const christmasGreenStrokeBase = tinycolor('rgb(15, 138, 95)');
export const christmasRedFillBase = tinycolor('rgb(245, 98, 77)');
export const christmasRedStrokeBase = tinycolor('rgb(204, 35, 30)');

export const eurovisionYellowFillBase = tinycolor('rgb(245, 220, 21)');
export const eurovisionYellowStrokeBase = tinycolor(eurovisionYellowFillBase.toRgbString()).darken(15);
export const eurovisionPinkFillBase = tinycolor('rgb(255, 70, 223)');
export const eurovisionPinkStrokeBase = tinycolor(eurovisionPinkFillBase.toRgbString()).darken(15);
export const eurovisionOrangeFillBase = tinycolor('rgb(255, 119, 20)');
export const eurovisionOrangeStrokeBase = tinycolor(eurovisionOrangeFillBase.toRgbString()).darken(15);
export const eurovisionBlueFillBase = tinycolor('rgb(31, 192, 223)');
export const eurovisionBlueStrokeBase = tinycolor(eurovisionBlueFillBase.toRgbString()).darken(15);
export const eurovisionVioletFillBase = tinycolor('rgb(102, 44, 182)');
export const eurovisionVioletStrokeBase = tinycolor(eurovisionVioletFillBase.toRgbString()).darken(15);

export const blueFillBase = tinycolor('rgb(0, 153, 255)');
export const blueStrokeBase = tinycolor('rgb(0, 77, 128)');

export const redFillBase = tinycolor('rgb(255, 54, 54)');
export const redStrokeBase = tinycolor('rgb(117, 25, 25)');

export const goldFillBase = tinycolor('rgb(255, 213, 0)');
export const goldStrokeBase = tinycolor('rgb(255, 183, 0)');

const alpha = (color: tinycolor.Instance, a: number) => color.setAlpha(a).toRgbString();

const colorSet = (fillBase: tinycolor.Instance, strokeBase: tinycolor.Instance) => ({
  text: alpha(fillBase, 1),
  stroke: alpha(strokeBase, 1),
  star: {
    fill: alpha(goldStrokeBase, 0.5),
    stroke: alpha(goldStrokeBase, 0),
    lineWidth: 1,
  },
  perfect: {
    fill: alpha(fillBase, 1),
    stroke: 'white',
    lineWidth: 1,
  },
  starPerfect: {
    fill: alpha(goldFillBase, 1),
    stroke: alpha(goldStrokeBase, 1),
    lineWidth: 2,
  },
  hit: {
    fill: alpha(fillBase, 0.9),
    stroke: alpha(strokeBase, 0),
    lineWidth: 1,
  },
  miss: {
    fill: alpha(fillBase, 0.25),
    stroke: alpha(strokeBase, 1),
    lineWidth: 1,
  },
});

export const colorSets = {
  blue: colorSet(blueFillBase, blueStrokeBase),
  red: colorSet(redFillBase, redStrokeBase),
  green: colorSet(tinycolor('rgb(0,183,0)'), tinycolor('rgb(0,84,0)')),
  yellow: colorSet(tinycolor('rgb(239,209,0)'), tinycolor('rgb(114,84,0)')),

  christmasGreen: colorSet(christmasGreenFillBase, christmasGreenStrokeBase),
  christmasRed: colorSet(christmasRedFillBase, christmasRedStrokeBase),

  eurovisionYellow: colorSet(eurovisionYellowFillBase, eurovisionYellowStrokeBase),
  eurovisionPink: colorSet(eurovisionPinkFillBase, eurovisionPinkStrokeBase),
  eurovisionOrange: colorSet(eurovisionOrangeFillBase, eurovisionOrangeStrokeBase),
  eurovisionBlue: colorSet(eurovisionBlueFillBase, eurovisionBlueStrokeBase),
  eurovisionViolet: colorSet(eurovisionVioletFillBase, eurovisionVioletStrokeBase),
};

let playerColors = [colorSets.blue, colorSets.red, colorSets.green, colorSets.yellow];

const styles = {
  colors: {
    players: playerColors,
    lines: {
      normal: {
        fill: 'rgba(127, 127, 127, .7)',
        stroke: 'black',
        lineWidth: 1,
      },
      star: {
        fill: 'rgba(158, 144, 106, 1)',
        stroke: alpha(goldStrokeBase, 1),
        lineWidth: 1,
      },
      freestyle: {
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'black',
        lineWidth: 2,
      },
    },
    text: {
      active: 'rgb(255, 165, 0)',
      activeBorder: 'rgb(101,75,22)',
      default: 'white',
      inactive: 'grey',
    },
  },
};

export const switchToTheme = (theme: backgroundTheme) => {
  if (theme === 'christmas' && playerColors[0] !== colorSets.christmasGreen) {
    playerColors = [colorSets.christmasGreen, colorSets.christmasRed];
    styles.colors.players = playerColors;
  } else if (theme === 'eurovision' && playerColors[0] !== colorSets.eurovisionYellow) {
    playerColors = [
      colorSets.eurovisionBlue,
      colorSets.eurovisionViolet,
      colorSets.eurovisionYellow,
      colorSets.eurovisionPink,
    ];
    styles.colors.players = playerColors;
  } else if (theme === 'regular' && playerColors[0] !== colorSets.blue) {
    playerColors = [colorSets.blue, colorSets.red, colorSets.green, colorSets.yellow];
    styles.colors.players = playerColors;
  }
};

export default styles;
