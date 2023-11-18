// gf = 52, 166, 95
// gs = 15, 138, 95
// rf = 245, 98, 77
// rs = 204, 35, 30

import tinycolor from 'tinycolor2';

export const blueFillBase = tinycolor('rgb(0, 153, 255)');
export const blueStrokeBase = tinycolor('rgb(0, 77, 128)');
export const blueFill = (a = 1) => blueFillBase.setAlpha(a).toRgbString();
export const blueStroke = (a = 1) => blueStrokeBase.setAlpha(a).toRgbString();

export const redFillBase = tinycolor('rgb(255, 54, 54)');
export const redStrokeBase = tinycolor('rgb(117, 25, 25)');
export const redFill = (a = 1) => redFillBase.setAlpha(a).toRgbString();
export const redStroke = (a = 1) => redStrokeBase.setAlpha(a).toRgbString();

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
};

const playerColors = [colorSets.blue, colorSets.red];

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
      active: 'orange',
      activeBorder: 'rgb(101,75,22)',
      default: 'white',
      inactive: 'grey',
    },
  },
};

export default styles;
