import { hsluvToHex, hexToHsluv } from 'hsluv';
import { converter, formatHex } from 'culori';

const DEFAULT_COLOR_SPACE:ColorSpace = 'okhsl';
const DEFAULT_MAX_HUE_SHIFT_AMOUNT = 60;

// hand-picked values, to try to optimize the quality of the palette
// when compared to handmade palettes
const LIG_STEPS = [97.0, 93.0, 87.0, 80.0, 68.0, 62.0, 55.0, 46.0, 37.0, 25.0];
const SAT_STEPS = [95.0, 95.0, 95.0, 97.0, 97.0, 97.0, 97.0, 97.0, 90.0, 80.0];

const OKHSL_CONVERTER = converter('okhsl');
const HSL_CONVERTER = converter('hsl');

/*************************
 * INTERFACES
 *************************/

 type ColorSpace = 'okhsl' | 'hsluv' | 'hsl';

interface ColorScale {
  [index: string]: string;
}

interface ColorMetadata {
  input: string;
  main: ColorScaleKey;
  analogous30: string[];
  analogous60: string[];
  complementary: string;
}

interface ColorObject {
  mode: string;
  h?: number;
  s?: number;
  l?: number;
  a?: number;
  r?: number;
  g?: number;
  b?: number;
}

export type ColorScaleKey =
  | 'orange'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'fuschia'
  | 'pink'
  | 'gray';

type ColorScales = {
  [key in ColorScaleKey]: ColorScale;
};

interface ColorPalette extends ColorScales {
  metadata?: ColorMetadata;
}

interface HueInformation {
  dir: 1 | -1;
  distance: number;
  maxDistance: number;
}

/** ***********************
 * SUPEPAL MAIN FUNCTIONS
 *************************/

export const superpal = (
  colorStringOrObject: string | object,
  adjustSaturation = true,
  addMetadata = true,
  colorSpace: ColorSpace = DEFAULT_COLOR_SPACE,
  maxHueShiftAmount: number = DEFAULT_MAX_HUE_SHIFT_AMOUNT,
): ColorPalette => {
  // perhaps redundant, but ensures that the string input
  // is treated consistently.
  // FIXME: how could p3 be supported?
  const hexColorIn = formatHex(colorStringOrObject);

  const correctColorSpaceHSLColor = hexToHSL(hexColorIn, colorSpace);

  const rawHSLspaceColor = hexToHSL(hexColorIn, 'hsl');
  const rawHSLspaceHues = createHueLookupArray(12)(rawHSLspaceColor[0]);

  const output: ColorPalette = <ColorPalette>{};

  rawHSLspaceHues.forEach((rawHSLspaceHue) => {
    const curHueName = hueName(rawHSLspaceHue);
    if (curHueName === undefined) return;

    const rawHSLSpaceHexForCurHue = colorToHex(
      {mode:'hsl', h:rawHSLspaceHue, s:rawHSLspaceColor[1]/100.0, l:rawHSLspaceColor[2]/100.0}
    );

    const curHueAngleInCorrectColorSpace = hexToHSL(rawHSLSpaceHexForCurHue, colorSpace)[0];

    // we pass in color with equal lightness/saturation here for scale
    // generation. perhaps not the "correct" lightness, but doesn't matter
    // since the lightness values get mangled anyhow in color creation
    const hexColor = colorToHex({mode: colorSpace,
      h:curHueAngleInCorrectColorSpace, s:correctColorSpaceHSLColor[1]/100.0, l:correctColorSpaceHSLColor[2]/100.0
    });

    const colorScaleArray = buildColorScale(hexColor, colorSpace, maxHueShiftAmount, adjustSaturation);
    output[curHueName] = colorScaleArray;
  });

  const grayScaleBaseColor = colorToHex({mode: colorSpace, h: correctColorSpaceHSLColor[0], s: 8.0/100.0, l: 50.0/100.0});
  output.gray = buildColorScale(grayScaleBaseColor, colorSpace, maxHueShiftAmount, true);

  if (addMetadata) {
    output.metadata = {
      input: hexColorIn,
      main: hueName(rawHSLspaceHues[0]),
      analogous30: [hueName(rawHSLspaceHues[1]), hueName(rawHSLspaceHues[rawHSLspaceHues.length - 1])],
      analogous60: [hueName(rawHSLspaceHues[2]), hueName(rawHSLspaceHues[rawHSLspaceHues.length - 2])],
      complementary: hueName(rawHSLspaceHues[rawHSLspaceHues.length / 2]),
    } as ColorMetadata;
  }

  return output;
};

export const buildColorScale = (
  hexColor: string,
  colorSpace: ColorSpace,
  maxHueShiftAmount: number,
  adjustSaturation = true,
): ColorScale => {
  const [inHue, inSat] = hexToHSL(hexColor, colorSpace);

  const okhslColor = hexToHSL(hexColor, 'okhsl');
  const okhslHueAngle = okhslColor[0];

  const minLightness = Math.min(...LIG_STEPS);
  const maxLightness = Math.max(...LIG_STEPS);

  let satAdjustment: number;
  if (adjustSaturation) {
    // A simple heuristic for adjusting the saturation to take into account the input
    // color saturation. This may need improving at some point.
    satAdjustment = Math.min(1.0, inSat / SAT_STEPS[0]);
  } else {
    satAdjustment = 1.0;
  }

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

    const outHexColor = colorToHex({mode: colorSpace, h:curHue, s:curSat/100.0, l:curLig/100.0});

    colorMap[index * 100] = outHexColor;
  });

  return colorMap;
};

// export culori colorToHex to make it available easily
// for libraries that use superpal and extend it with hsluv support
export const colorToHex = (colorStringOrObject: string | ColorObject) => {
  const c = <ColorObject>colorStringOrObject;
  if(c.mode && c.mode === 'hsluv') {
    if(!c.s || !c.h || !c.l) return;
    return hsluvToHex([c.h, c.s*100.0, c.l*100.0]);
  } else {
    return formatHex(colorStringOrObject);
  }
}

/** ***********************
 * HELPERS: COLOR CONVERSION AND ADJUSTMENT
 *************************/

const hexToHSL = (hexColor: string, colorSpaceIn: ColorSpace) => {
  let inHue;
  let inSat;
  let inLig;
  if (colorSpaceIn === 'okhsl') {
    const raw = OKHSL_CONVERTER(hexColor);
    if (raw.h === undefined) raw.h = 0.0;
    [inHue, inSat, inLig] = [raw.h, raw.s * 100.0, raw.l * 100.0];
  } else if (colorSpaceIn === 'hsluv') {
    [inHue, inSat, inLig] = hexToHsluv(hexColor);
  } else if (colorSpaceIn === 'hsl') {
    const raw = HSL_CONVERTER(hexColor);
    if (raw.h === undefined) raw.h = 0.0;
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
    const { dir, distance } = findNearestHue(okhslHue, 'light');

    let hueFractionInScale = easeInQuad(mpDistance / (maxLightness - lightnessMidpoint + 15.0));

    // hack to make dark/light colors spread out a bit over hues
    if (hueFractionInScale > 0.2 && distance < 50.0) hueFractionInScale = 0.2;

    rotation = dir * Math.min(distance, maxHueShiftAmount) * hueFractionInScale;
  } else {
    const { dir, distance } = findNearestHue(okhslHue, 'dark');

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
  let distance = 0;
  let maxDistance = 0;

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

/** ***********************
 * HELPERS: EASING
 *************************/

const easeInQuad = (x: number) => {
  return x * x;
};

const easeOutCubic = (x: number) => {
  return 1 - Math.pow(1 - x, 3);
};

/** ***********************
 * HELPERS: NAMED SCALES
 *************************/

// based on palx
// https://github.com/jxnblk/palx/blob/master/palx/src/index.js
// note, red is twice (at 0 and at 360 degrees)
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
] as ColorScaleKey[];

const hueName = (inHue: number): ColorScaleKey => {
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

/** ***********************
 * DEFAULT EXPORT
 *************************/

export default superpal;
