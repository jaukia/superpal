
// tslint:disable-next-line: no-var-requires
const culori = require('culori/require');

import { hsluvToHex, hexToHsluv } from 'hsluv';

const DEFAULT_COLOR_SPACE: string = 'Okhsl';
const DEFAULT_MAX_HUE_SHIFT_AMOUNT = 60;

const LIG_STEPS = [97.0, 93.0, 87.0, 80.0, 68.0, 62.0, 55.0, 46.0, 37.0, 25.0];
const SAT_STEPS = [95.0, 95.0, 95.0, 97.0, 97.0, 97.0, 97.0, 97.0, 90.0, 80.0];

const OKHSL_CONVERTER = culori.converter('okhsl');
const HSL_CONVERTER = culori.converter('hsl');

/*************************
 * INTERFACES
 *************************/

interface ColorScale {
  [index: string]: string;
}

interface ColorPalette {
  [index: string]: ColorScale;
}

interface HueInformation {
  dir: 1 | -1;
  distance: number;
  maxDistance: number;
}

/*************************
 * SUPEPAL MAIN FUNCTIONS
 *************************/

export const superPal = (
  hexColorIn: string,
  colorSpace: string = DEFAULT_COLOR_SPACE,
  maxHueShiftAmount: number = DEFAULT_MAX_HUE_SHIFT_AMOUNT,
): ColorPalette => {
  const correctColorSpaceHSLColor = hexToHSL(hexColorIn, colorSpace);

  const rawHSLspaceColor = hexToHSL(hexColorIn, 'HSL');
  const rawHSLspaceHues = createHueLookupArray(12)(rawHSLspaceColor[0]);

  const output: ColorPalette = {};

  const grayScaleBaseColor = HSLtoHex([correctColorSpaceHSLColor[0], 8.0, 50.0], colorSpace);
  output.gray = superPalColorScale(grayScaleBaseColor, colorSpace, maxHueShiftAmount);

  rawHSLspaceHues.forEach((rawHSLspaceHue) => {
    const curHueName = hueName(rawHSLspaceHue);
    if (curHueName === undefined) return;

    const rawHSLSpaceHexForCurHue = HSLtoHex([rawHSLspaceHue, rawHSLspaceColor[1], rawHSLspaceColor[2]], 'HSL');

    const curHueAngleInCorrectColorSpace = hexToHSL(rawHSLSpaceHexForCurHue, colorSpace)[0];

    // we pass in color with equal lightness/saturation here for scale
    // generation. perhaps not the "correct" lightness, but doesn't matter
    // since the lightness values get mangled anyhow in color creation
    const hexColor = HSLtoHex(
      [curHueAngleInCorrectColorSpace, correctColorSpaceHSLColor[1], correctColorSpaceHSLColor[2]],
      colorSpace,
    );

    const colorScaleArray = superPalColorScale(hexColor, colorSpace, maxHueShiftAmount);
    output[curHueName] = colorScaleArray;
  });

  return output;
};

// this section is completely new
// and not based on palx
export const superPalColorScale = (hexColor: string, colorSpace: string, maxHueShiftAmount: number): ColorScale => {
  const [inHue, inSat, inLig] = hexToHSL(hexColor, colorSpace);

  const okhslColor = hexToHSL(hexColor, 'Okhsl');
  const okhslHueAngle = okhslColor[0];

  const minLightness = Math.min(...LIG_STEPS);
  const maxLightness = Math.max(...LIG_STEPS);

  // A simple heuristic for adjusting the saturation to take into account the input
  // color saturation. This may need improving at some point.
  const satAdjustment = Math.min(1.0, inSat / SAT_STEPS[0]);

  const colorMap: ColorScale = {};

  LIG_STEPS.forEach((curLig, index) => {
    // recalculating color as okhsl to get correct angles, since not sure
    // what format it is really in, this would be simpler
    // if/when we can always assume okhsl color space
    const curHueRotation = rotateHue(okhslHueAngle, curLig, minLightness, maxLightness, maxHueShiftAmount);

    // this is not quite correct, since we are taking a delta angle from
    // okhsl color space and applying it potentially to something else, but
    // perhaps that is not a major issue
    const curHue = inHue + curHueRotation;

    const curSat = satAdjustment * SAT_STEPS[index];
    const curColorString = Math.round(curHue) + ',' + Math.round(curSat) + ',' + curLig;

    const outHexColor = HSLtoHex([curHue, curSat, curLig], colorSpace);

    colorMap[index * 100] = outHexColor;
  });

  return colorMap;
};

/*************************
 * HELPERS: COLOR CONVERSION AND ADJUSTMENT
 *************************/

const HSLtoHex = (colorArray: number[], colorSpaceIn: string) => {
  const [curHue, curSat, curLig] = colorArray;

  let outHexColor;

  if (colorSpaceIn === 'Okhsl') {
    outHexColor = culori.formatHex({ mode: 'okhsl', h: curHue, s: curSat / 100.0, l: curLig / 100.0 });
  } else if (colorSpaceIn === 'HSLuv') {
    outHexColor = hsluvToHex([curHue, curSat, curLig]);
  } else if (colorSpaceIn === 'HSL') {
    outHexColor = culori.formatHex({ mode: 'hsl', h: curHue, s: curSat / 100.0, l: curLig / 100.0 });
  }

  return outHexColor;
};

const hexToHSL = (hexColor: string, colorSpaceIn: string) => {
  let inHue;
  let inSat;
  let inLig;
  if (colorSpaceIn === 'Okhsl') {
    const raw = OKHSL_CONVERTER(hexColor);
    [inHue, inSat, inLig] = [raw.h, raw.s * 100.0, raw.l * 100.0];
  } else if (colorSpaceIn === 'HSLuv') {
    [inHue, inSat, inLig] = hexToHsluv(hexColor);
  } else if (colorSpaceIn === 'HSL') {
    const raw = HSL_CONVERTER(hexColor);
    [inHue, inSat, inLig] = [raw.h, raw.s * 100.0, raw.l * 100.0];
  }

  return [inHue, inSat, inLig];
};

const rotateHue = (
  okhslHue: number,
  lightness: number,
  minLightness: number,
  maxLightness: number,
  maxHueShiftAmount: number,
) => {
  const lightnessMidpoint = maxLightness - minLightness;
  const mpDistance = Math.abs(lightness - lightnessMidpoint);

  let rotation;

  // FIXME: could add a heuristic that we bend less
  // colors that have large hueFractionInScale but small distance
  // -> not sure if there is some elegant math way to express that...

  // One interesting approach would be to change the whole
  // rotateHue + findNearestHue to instead use 1d forces that repel nodes
  // (in the lightness end points or at every step)
  // repels could be both other nodes and certain ugly shades (dark yellow)
  // https://github.com/vasturiano/d3-force-3d

  if (lightness > lightnessMidpoint) {
    const { dir, distance, maxDistance } = findNearestHue(okhslHue, 'light');

    let hueFractionInScale = easeInQuad(mpDistance / (maxLightness - lightnessMidpoint + 15.0));

    // hack to make dark/light colors spread out a bit over hues
    if (hueFractionInScale > 0.2 && distance < 50.0) hueFractionInScale = 0.2;

    rotation = dir * Math.min(distance, maxHueShiftAmount) * hueFractionInScale;
  } else {
    const { dir, distance, maxDistance } = findNearestHue(okhslHue, 'dark');

    let hueFractionInScale = easeOutCubic(mpDistance / (lightnessMidpoint - minLightness + 40.0));

    // hack to make dark/light colors spread out a bit over hues
    if (hueFractionInScale > 0.4 && distance < 70.0) hueFractionInScale = 0.4;

    rotation = dir * Math.min(distance, maxHueShiftAmount) * hueFractionInScale;
  }

  return rotation;
};

const findNearestHue = (okhslHue: number, mode: 'light' | 'dark'): HueInformation => {
  let hue = okhslHue % 360;
  if (hue < 0) hue += 360.0;

  let dir: 1 | -1 = -1;
  let distance: number = 0;
  let maxDistance: number = 0;

  if (mode === 'light') {
    const okhslColorStops = {
      red: 30.0,
      yellow: 105.0, // has to be more than 114
      green: 150.0,
      cyan: 165.0,
      blue: 270.0,
      magenta: 345.0,
    };

    const maxDistances = {
      magentaRed: 360.0 + okhslColorStops.red - okhslColorStops.magenta,
      redYellow: okhslColorStops.yellow - okhslColorStops.red,
      yellowGreen: okhslColorStops.green - okhslColorStops.yellow,
      greenCyan: okhslColorStops.cyan - okhslColorStops.green,
      cyanBlue: okhslColorStops.blue - okhslColorStops.cyan,
      blueMagenta: okhslColorStops.magenta - okhslColorStops.blue,
    };

    if (hue < okhslColorStops.red) {
      // magenta-red -> magenta
      dir = -1;
      distance = Math.abs(okhslColorStops.magenta - 360.0 - hue);
      maxDistance = maxDistances.magentaRed;
    } else if (hue < okhslColorStops.yellow) {
      // red-yellow -> yellow
      dir = +1;
      distance = Math.abs(okhslColorStops.yellow - hue);
      maxDistance = maxDistances.redYellow;
    } else if (hue < okhslColorStops.green) {
      // yellow-green -> yellow
      dir = -1;
      distance = Math.abs(okhslColorStops.yellow - hue);
      maxDistance = maxDistances.yellowGreen;
    } else if (hue < okhslColorStops.cyan) {
      // green-cyan -> cyan
      dir = +1;
      distance = Math.abs(okhslColorStops.cyan - hue);
      maxDistance = maxDistances.greenCyan;
    } else if (hue < okhslColorStops.blue) {
      // cyan-blue -> cyan
      dir = -1;
      distance = Math.abs(okhslColorStops.cyan - hue);
      maxDistance = maxDistances.cyanBlue;
    } else if (hue < okhslColorStops.magenta) {
      // blue-magenta -> magenta
      dir = +1;
      distance = Math.abs(okhslColorStops.magenta - hue);
      maxDistance = maxDistances.blueMagenta;
    } else {
      // magenta-red -> magenta (cont)
      dir = -1;
      distance = Math.abs(okhslColorStops.magenta - hue);
      maxDistance = maxDistances.magentaRed;
    }
  } else if (mode === 'dark') {
    const okhslColorStops = {
      red: 30.0,
      yellow: 130.0,
      green: 150.0,
      cyan: 165.0,
      blue: 270.0,
      magenta: 345.0,
    };

    const maxDistances = {
      magentaRed: 360.0 + okhslColorStops.red - okhslColorStops.magenta,
      redYellow: okhslColorStops.yellow - okhslColorStops.red,
      yellowGreen: okhslColorStops.green - okhslColorStops.yellow,
      greenCyan: okhslColorStops.cyan - okhslColorStops.green,
      cyanBlue: okhslColorStops.blue - okhslColorStops.cyan,
      blueMagenta: okhslColorStops.magenta - okhslColorStops.blue,
    };

    if (hue < okhslColorStops.red) {
      // magenta-red -> magenta
      dir = +1;
      distance = Math.abs(okhslColorStops.red - hue);
      maxDistance = maxDistances.magentaRed;
    } else if (hue < okhslColorStops.yellow) {
      // red-yellow -> yellow
      dir = -1;
      distance = Math.abs(okhslColorStops.red - hue);
      maxDistance = maxDistances.redYellow;
    } else if (hue < okhslColorStops.green) {
      // yellow-green -> yellow
      dir = +1;
      distance = Math.abs(okhslColorStops.green - hue);
      maxDistance = maxDistances.yellowGreen;
    } else if (hue < okhslColorStops.cyan) {
      // green-cyan -> cyan
      dir = -1;
      distance = Math.abs(okhslColorStops.green - hue);
      maxDistance = maxDistances.greenCyan;
    } else if (hue < okhslColorStops.blue) {
      // cyan-blue -> cyan
      dir = +1;
      distance = Math.abs(okhslColorStops.blue - hue);
      maxDistance = maxDistances.cyanBlue;
    } else if (hue < okhslColorStops.magenta) {
      // blue-magenta -> magenta
      dir = -1;
      distance = Math.abs(okhslColorStops.blue - hue);
      maxDistance = maxDistances.blueMagenta;
    } else {
      // magenta-red -> magenta (cont)
      dir = +1;
      distance = Math.abs(360.0 + okhslColorStops.red - hue);
      maxDistance = maxDistances.magentaRed;
    }
  }

  return { dir, distance, maxDistance };
};

/*************************
 * HELPERS: EASING
 *************************/

const easeInQuad = (x: number) => {
  return x * x;
};

const easeOutCubic = (x: number) => {
  return 1 - Math.pow(1 - x, 3);
};

/*************************
 * HELPERS: NAMED SCALES
 *************************/

// based on palx
// https://github.com/jxnblk/palx/blob/master/palx/src/index.js
const COLOR_SCALE_NAMES = [
  'red', // 0
  'orange', // 30
  'yellow', // 60
  'lime', // 90
  'green', // 120
  'teal', // 150
  'cyan', // 180
  'blue', // 210
  'indigo', // 240
  'violet', // 270
  'fuschia', // 300
  'pink', // 330
  'red', // 360
];

const hueName = (inHue: number) => {
  const i = Math.round((inHue - 2) / 30);
  return COLOR_SCALE_NAMES[i];
};

const createHueLookupArray = (length: number) => {
  const hueStep = 360 / length;
  return (baseHue: number) => {
    const hueArray = [];
    for (let i = 0; i < length; i++) {
      hueArray[i] = Math.floor((baseHue + i * hueStep) % 360);
    }
    return hueArray;
  };
};

/*************************
 * DEFAULT EXPORT
 *************************/

export default superPal;
