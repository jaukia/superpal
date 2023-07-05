import { hsluvToHex, hexToHsluv } from 'hsluv';
import { converter, formatHex } from 'culori';

const OKHSL_CONVERTER = converter('okhsl');
const HSL_CONVERTER = converter('hsl');

/*************************
 * INTERFACES AND TYPES
 *************************/

export type ColorSpace = 'okhsl' | 'hsluv' | 'hsl';

export interface ColorScale {
  [index: string]: string;
}

export interface ColorMetadata {
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

interface HslColorObject {
  mode: string;
  h: number;
  s: number;
  l: number;
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
  | 'fuchsia'
  | 'pink'
  | 'gray';

type ColorScales = {
  [key in ColorScaleKey]: ColorScale;
};

export interface ColorPalette extends ColorScales {
  metadata: ColorMetadata;
}

interface HueInformation {
  dir: 1 | -1;
  distance: number;
  maxDistance: number;
}

type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

interface PaletteParams {
  adjustSaturation: boolean;
  colorSpace: ColorSpace;
  maxHueShiftAmount: number;
  colorLightnessValues: number[];
  grayLightnessValues: number[];
  saturationFinetune: number[] | false;
  grayscaleSaturation: number;
  spreadOutMinMaxValues: boolean;
  colorKeys: string[];
  returnFullPalette: boolean;
}

const defaultPaletteParams: PaletteParams = {
  adjustSaturation: true,
  colorSpace: 'okhsl',
  maxHueShiftAmount: 60.0,
  colorKeys: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  colorLightnessValues: [0.95, 0.91, 0.85, 0.76, 0.65, 0.54, 0.45, 0.37, 0.31, 0.26, 0.24],
  grayLightnessValues: [0.97, 0.93, 0.87, 0.77, 0.63, 0.45, 0.3, 0.19, 0.13, 0.08, 0.04],
  saturationFinetune: [0.95, 0.95, 0.95, 0.97, 0.97, 0.97, 0.97, 0.97, 0.9, 0.8, 0.7],
  grayscaleSaturation: 0.08,
  spreadOutMinMaxValues: true,
  returnFullPalette: true,
};

/** ***********************
 * SUPEPAL MAIN FUNCTIONS
 *************************/

export const superpal = (
  colorStringOrObject: string | object,
  paramsIn: Optional<PaletteParams> = {},
): ColorPalette => {
  const params = {
    ...defaultPaletteParams,
    ...paramsIn,
  };

  // perhaps redundant, but ensures that the string input
  // is treated consistently.
  // FIXME: how could p3 be supported?
  let hexColorIn = formatHex(colorStringOrObject);
  
  // hack to make sure hue is computed even for black
  // to not have scales collapse
  if(hexColorIn=="#000000" || hexColorIn=="#010101") hexColorIn="#020202";

  const correctColorSpaceHSLColor = hexToColor(hexColorIn, params.colorSpace);
  const rawHSLspaceColor = colorToColor(correctColorSpaceHSLColor, 'hsl');
  
  let rawHSLspaceHues;
  if(params.returnFullPalette) {
    rawHSLspaceHues = createHueLookupArray(12)(rawHSLspaceColor.h);
  } else {
    rawHSLspaceHues = [0];
  }

  const output: ColorPalette = <ColorPalette>{};

  rawHSLspaceHues.forEach((rawHSLspaceHue) => {
    const curHueName = hueName(rawHSLspaceHue);
    if (curHueName === undefined) return;

    const curHueInCorrectColorSpace = colorToColor({ ...rawHSLspaceColor, h: rawHSLspaceHue }, params.colorSpace);

    // we pass in color with equal lightness/saturation here for scale
    // generation. perhaps not the "correct" lightness, but doesn't matter
    // since the lightness values get mangled anyhow in color creation
    const baseColor = {
      mode: params.colorSpace,
      h: curHueInCorrectColorSpace.h,
      s: correctColorSpaceHSLColor.s,
      l: correctColorSpaceHSLColor.l,
    };

    const colorScaleArray = buildColorScale(baseColor, params, false);
    output[curHueName] = colorScaleArray;
  });

  const grayScaleBaseColor = {
    mode: params.colorSpace,
    h: correctColorSpaceHSLColor.h,
    s: params.grayscaleSaturation,
    l: 0.5,
  };
  output.gray = buildColorScale(grayScaleBaseColor, params, true);

  output.metadata = {
    input: hexColorIn,
    main: hueName(rawHSLspaceHues[0])
  } as ColorMetadata;

  if(rawHSLspaceHues.length > 1) {
    output.metadata.analogous30 = [hueName(rawHSLspaceHues[1]), hueName(rawHSLspaceHues[rawHSLspaceHues.length - 1])];
    output.metadata.analogous60 = [hueName(rawHSLspaceHues[2]), hueName(rawHSLspaceHues[rawHSLspaceHues.length - 2])];
    output.metadata.complementary = hueName(rawHSLspaceHues[rawHSLspaceHues.length / 2]);
  }

  return output;
};

export const buildColorScale = (baseColor: HslColorObject, params: PaletteParams, isGray: boolean): ColorScale => {
  const okhslColor = colorToColor(baseColor, 'okhsl');
  const okhslHueAngle = okhslColor.h;

  const lightnessValues = isGray ? params.grayLightnessValues : params.colorLightnessValues;

  const minLightness = Math.min(...lightnessValues);
  const maxLightness = Math.max(...lightnessValues);

  let adjustedSatValue: number;
  if (params.adjustSaturation) {
    // A simple heuristic for adjusting the saturation to take into account the input
    // color saturation. This may need improving at some point.
    const fineTune = params.saturationFinetune ? params.saturationFinetune[0] : 1.0;
    adjustedSatValue = Math.min(1.0, baseColor.s / fineTune);
  } else {
    adjustedSatValue = 1.0;
  }

  const colorMap: ColorScale = {};

  lightnessValues.forEach((curLig, index) => {
    // recalculating color as okhsl to get correct angles, since not sure
    // what format it is really in, this would be simpler
    // if/when we can always assume okhsl color space
    const curHueRotation = rotateHue(
      okhslHueAngle,
      curLig,
      minLightness,
      maxLightness,
      params.maxHueShiftAmount,
      params.spreadOutMinMaxValues,
    );

    // this is not quite correct, since we are taking a delta angle from
    // okhsl color space and applying it potentially to something else, but
    // perhaps that is not a major issue
    const curHue = baseColor.h + curHueRotation;

    const satMultiplier = params.saturationFinetune ? params.saturationFinetune[index] : 1.0;

    const curSat = adjustedSatValue * satMultiplier;
    const outHexColor = colorToHex({ mode: params.colorSpace, h: curHue, s: curSat, l: curLig });
    colorMap[params.colorKeys[index]] = outHexColor;
  });

  return colorMap;
};

/** ***********************
 * HELPERS: EXPORTED COLOR CONVERTERS
 *************************/

// culori-like color object to hex conversion
// but supports also hsluv
export const colorToHex = (colorStringOrObject: string | ColorObject) => {
  const c = <ColorObject>colorStringOrObject;
  if (c.mode && c.mode == 'hsluv') {
    if (!c.s || !c.h || !c.l) return;
    return hsluvToHex([c.h, c.s * 100.0, c.l * 100.0]);
  } else {
    return formatHex(colorStringOrObject);
  }
};

// hex to culori-like color object conversion
// but supports also hsluv
export const hexToColor = (hexColor: string, colorSpaceIn: ColorSpace): HslColorObject => {
  let retValue: HslColorObject;
  if (colorSpaceIn == 'okhsl') {
    retValue = OKHSL_CONVERTER(hexColor);
  } else if (colorSpaceIn == 'hsluv') {
    const [inHue, inSat, inLig] = hexToHsluv(hexColor);
    retValue = { mode: 'hsluv', h: inHue, s: inSat / 100.0, l: inLig / 100.0 };
  } else {
    retValue = HSL_CONVERTER(hexColor);
  }
  return retValue;
};

// culori-like color object to culori-like color object
// in another color space conversion, supports also hsluv
export const colorToColor = (colorObject: ColorObject, targetColorSpace: ColorSpace) => {
  let retValue: HslColorObject;

  // FIXME: some other intermediate format could be better than hex here
  if (colorObject.mode == 'hsluv' || targetColorSpace == 'hsluv') {
    return hexToColor(colorToHex(colorObject), targetColorSpace);
  } else {
    if (targetColorSpace == 'okhsl') {
      retValue = OKHSL_CONVERTER(colorObject);
    } else {
      retValue = HSL_CONVERTER(colorObject);
    }
  }

  return retValue;
};

/** ***********************
 * HELPERS: HUE ROTATION
 *************************/

const rotateHue = (
  okhslHue: number,
  lightness: number,
  minLightness: number,
  maxLightness: number,
  maxHueShiftAmount: number,
  spreadOutMinMaxValues: boolean,
) => {
  // FIXME: could add a heuristic that we bend less
  // colors that have large hueFractionInScale but small distance
  // -> not sure if there is some elegant math way to express that...

  // One interesting approach would be to change the whole
  // rotateHue + findNearestHue to instead use 1d forces that repel nodes
  // (in the lightness end points or at every step)
  // repels could be both other nodes and certain ugly shades (dark yellow)
  // https://github.com/vasturiano/d3-force-3d

  const lightnessMidpoint = maxLightness - minLightness;
  const isLight = lightness > lightnessMidpoint;
  const { dir, distance } = findNearestHue(okhslHue, isLight ? 'light' : 'dark');

  let hueFractionInScale = 1.0;
  // hack to make dark/light colors spread out a bit over hues
  if (spreadOutMinMaxValues) {
    const lightnessMidpointDistance = Math.abs(lightness - lightnessMidpoint);
    if (isLight) {
      hueFractionInScale = easeInQuad(lightnessMidpointDistance / (maxLightness - lightnessMidpoint + 0.15));
      if (hueFractionInScale > 0.2 && distance < 50.0) hueFractionInScale = 0.2;
    } else {
      hueFractionInScale = easeOutCubic(lightnessMidpointDistance / (lightnessMidpoint - minLightness + 0.4));
      if (hueFractionInScale > 0.4 && distance < 70.0) hueFractionInScale = 0.4;
    }
  }

  const rotation = dir * Math.min(distance, maxHueShiftAmount) * hueFractionInScale;
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
 * HELPERS: NAMED HUE SCALES
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
  'fuchsia', // 300
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
