# Superpal

Create vivid UI palettes automatically from a single input color.

Try it out on Runkit https://npm.runkit.com/superpal with this example:

```js
var superpal = require("superpal");
const colorData = superpal.default("#60a5fa");
```

Import in your code:

```js
import { superpal } from "superpal";
const colorData = superpal("#60a5fa");
// => returns object with 12 color hue scales, 
//    a gray hue scale as well as color metadata
//    (see "Example output" below).
```

Example project on Observable that shows visully how the library works:
https://observablehq.com/d/4ce9e569386d7210

## Example Output

```json
{
  "gray": {
    "0": "#f5f7f7",
    "100": "#e9ebed",
    "200": "#d7dbde",
    "300": "#c2c7cd",
    "400": "#a0a7af",
    "500": "#9097a0",
    "600": "#7e848d",
    "700": "#686d76",
    "800": "#52575e",
    "900": "#373a3f"
  },
  "blue": {
    "0": "#edf9ff",
    "100": "#d8effe",
    "200": "#bddffe",
    "300": "#9ecbfe",
    "400": "#6aa8fc",
    "500": "#5494fa",
    "600": "#3a7df4",
    "700": "#1d63dd",
    "800": "#1d51ac",
    "900": "#163770"
  },
  "indigo": {
    "0": "#f8f4ff",
    "100": "#ece7fe",
    "200": "#d8d5fe",
    "300": "#bdc1fe",
    "400": "#929cfd",
    "500": "#7d88fc",
    "600": "#6770f9",
    "700": "#514ef1",
    "800": "#403dc4",
    "900": "#2a2c7e"
  },
  "violet": {
    "0": "#fbf4fe",
    "100": "#f5e4fe",
    "200": "#eacdfd",
    "300": "#dab4fd",
    "400": "#ba89fd",
    "500": "#a178fd",
    "600": "#8c5efa",
    "700": "#7931f2",
    "800": "#602abf",
    "900": "#3f227c"
  },
  "fuchsia": {
    "0": "#fdf3fb",
    "100": "#fbe2f6",
    "200": "#f8c9f0",
    "300": "#f7a7ee",
    "400": "#e36df5",
    "500": "#c361f9",
    "600": "#aa46f7",
    "700": "#9320de",
    "800": "#7420af",
    "900": "#4c1c72"
  },
  "pink": {
    "0": "#fff3f7",
    "100": "#fee3ed",
    "200": "#fdcadd",
    "300": "#fdaaca",
    "400": "#fc6ea1",
    "500": "#fa4b81",
    "600": "#ea2566",
    "700": "#c51553",
    "800": "#9c1842",
    "900": "#67172d"
  },
  "red": {
    "0": "#fff3f3",
    "100": "#fee4e4",
    "200": "#fecccb",
    "300": "#fdafa9",
    "400": "#fb796e",
    "500": "#f7594f",
    "600": "#e93530",
    "700": "#c52523",
    "800": "#992722",
    "900": "#651f1a"
  },
  "orange": {
    "0": "#fff5e7",
    "100": "#ffe8c6",
    "200": "#fed295",
    "300": "#fdb75b",
    "400": "#e78e1c",
    "500": "#db7915",
    "600": "#c6660e",
    "700": "#a55408",
    "800": "#83430c",
    "900": "#582d0c"
  },
  "yellow": {
    "0": "#f8fbd0",
    "100": "#f0f479",
    "200": "#e0e434",
    "300": "#cbd118",
    "400": "#b6aa13",
    "500": "#b29311",
    "600": "#a77c0d",
    "700": "#946108",
    "800": "#7b490c",
    "900": "#562f0c"
  },
  "lime": {
    "0": "#edfed9",
    "100": "#d2fc9a",
    "200": "#acf442",
    "300": "#8de22c",
    "400": "#69c02d",
    "500": "#53af31",
    "600": "#449b2f",
    "700": "#388027",
    "800": "#326527",
    "900": "#23431c"
  },
  "green": {
    "0": "#e9fee0",
    "100": "#c8fdb1",
    "200": "#8afa64",
    "300": "#50eb4a",
    "400": "#40c44e",
    "500": "#38b14c",
    "600": "#319c45",
    "700": "#288138",
    "800": "#296632",
    "900": "#1e4422"
  },
  "teal": {
    "0": "#e2ffef",
    "100": "#b5fed9",
    "200": "#59fcb6",
    "300": "#2ee9a0",
    "400": "#28c382",
    "500": "#26b171",
    "600": "#239b61",
    "700": "#1c8150",
    "800": "#1f6641",
    "900": "#18442c"
  },
  "cyan": {
    "0": "#e1fdfc",
    "100": "#b0fcf9",
    "200": "#5bf4f5",
    "300": "#29e1e8",
    "400": "#18bbce",
    "500": "#15a7c7",
    "600": "#1191b6",
    "700": "#0b7897",
    "800": "#106078",
    "900": "#0e4050"
  },
  "metadata": {
    "input": "#60a5fa",
    "main": "blue",
    "analogous30": [
      "indigo",
      "cyan"
    ],
    "analogous60": [
      "violet",
      "teal"
    ],
    "complementary": "orange"
  }
}
```

## Install

```shell
npm install superpal
# or
yarn add superpal
```

## About

This is still very much work in progress and most likely has bugs and issues. The goal is to create palettes that would be similar in style and equally good in quality as hand tuned scales of, say, Tailwind, Chakra, Open Color, IBM Carbon, Next UI or Radix Colors.

Inspired by and borrowing the API, color scale names and a couple of color scale related helper functions from [Palx](https://github.com/jxnblk/palx).

What makes Superpal different from, say, Palx:

* Uses Okhsl (and HSLuv) color spaces for, hopefully, more vivid color interpolation
* Hue rotation/shifting to create more appealing scales
* Metadata on complementary and analogous colors to make it easier to create pleasing color combinations

Areas that could be further improved:

* Contrast ratio calculation
* Further improve yellow/green scales
* Direct compatibility with tools such as Tailwind
* Add semantic meta-data and sematic tokens on top of the base scales automatically

## Related Projects, Links and Inspiration

Tools that in inspired this:

* https://github.com/jxnblk/palx
* https://tailwind.ink
* https://ryanberg.net/work/blazer-colors/
* https://colorcolor.in (and https://colorxcolor.ryanberg.net)
* https://leonardocolor.io/theme.html

Color conversion libraries used by Superpal:

* https://culorijs.org
* https://www.hsluv.org

Articles:

* https://stripe.com/blog/accessible-color-systems
* https://uxplanet.org/designing-systematic-colors-b5d2605b15c
* https://twitter.com/adamwathan/status/1350454922177871872

More color tools that are worth checking out:

* https://lyft-colorbox.herokuapp.com
* https://components.ai/color-scale/
* https://copypalette.app
* https://www.tailwindshades.com
* http://cu-visualab.org/ColorCrafter/
* http://components.ai/color-scale/
* https://geenes.app/editor/explore

## License

MIT License