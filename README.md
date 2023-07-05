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
// => returns object with 12 color hue scales with 12 colors each, 
//    a gray hue scale as well as color metadata
//    (see "Example output" below).
```

Interactive notebook with visualizations on Observable:
https://observablehq.com/@jaukia/superpal-npm-example

## Example Output

```json
{
  "blue": {
    "50": "#e1f4ff",
    "100": "#cdeafe",
    "200": "#b3dafe",
    "300": "#8cc0fd",
    "400": "#5d9efb",
    "500": "#357af3",
    "600": "#1b61d9",
    "700": "#124eb5",
    "800": "#164391",
    "900": "#183974",
    "950": "#1a3666",
  },
  "cyan": {
    "50": "#c9fdfa",
    "100": "#91fbf7",
    "200": "#48eff0",
    "300": "#1fd5dc",
    "400": "#16b1c8",
    "500": "#108fb2",
    "600": "#0b7693",
    "700": "#076079",
    "800": "#0b5064",
    "900": "#0f4353",
    "950": "#133d4c",
  },
  "fuchsia": {
    "50": "#fcebf9",
    "100": "#fadaf4",
    "200": "#f7c0ef",
    "300": "#f593ed",
    "400": "#d664f7",
    "500": "#a841f6",
    "600": "#8f1fda",
    "700": "#7613b5",
    "800": "#621894",
    "900": "#4f1e76",
    "950": "#462365",
  },
  "gray": {
    "50": "#f6f6f7",
    "100": "#e9ebed",
    "200": "#d7dadf",
    "300": "#babfc6",
    "400": "#9399a2",
    "500": "#656b73",
    "600": "#42464d",
    "700": "#292c31",
    "800": "#1c1e21",
    "900": "#101113",
    "950": "#050607",
  },
  "green": {
    "50": "#d9fec9",
    "100": "#b6fd95",
    "200": "#7bf653",
    "300": "#4ade4d",
    "400": "#3dbb4d",
    "500": "#309943",
    "600": "#277e37",
    "700": "#1f672c",
    "800": "#215528",
    "900": "#1f4624",
    "950": "#204023",
  },
  "indigo": {
    "50": "#f3edff",
    "100": "#e7e1fe",
    "200": "#d1cffe",
    "300": "#afb4fd",
    "400": "#8892fc",
    "500": "#646df8",
    "600": "#4e4bee",
    "700": "#3f30d5",
    "800": "#3431a7",
    "900": "#2c2f82",
    "950": "#2a2e6f",
  },
  "lime": {
    "50": "#e0fdbc",
    "100": "#c3fc6e",
    "200": "#a5ef38",
    "300": "#83d62a",
    "400": "#60b72e",
    "500": "#43982e",
    "600": "#367d25",
    "700": "#2c661d",
    "800": "#29541f",
    "900": "#25461e",
    "950": "#24401e",
  },
  "orange": {
    "50": "#ffeed7",
    "100": "#fee1b6",
    "200": "#fecb85",
    "300": "#faa833",
    "400": "#e08418",
    "500": "#c3640d",
    "600": "#a25107",
    "700": "#854205",
    "800": "#6f3708",
    "900": "#5b2f0d",
    "950": "#522d12",
  },
  "pink": {
    "50": "#feebf2",
    "100": "#fedae8",
    "200": "#fdc1d8",
    "300": "#fd97bf",
    "400": "#fb5d94",
    "500": "#e72164",
    "600": "#c11351",
    "700": "#a00b41",
    "800": "#841137",
    "900": "#6b172f",
    "950": "#5f1d2d",
  },
  "red": {
    "50": "#ffecec",
    "100": "#fedcdc",
    "200": "#fec4c2",
    "300": "#fd9e96",
    "400": "#f9695f",
    "500": "#e6332e",
    "600": "#c12422",
    "700": "#9f1b19",
    "800": "#811f1b",
    "900": "#69201b",
    "950": "#5d221d",
  },
  "teal": {
    "50": "#cdffe4",
    "100": "#9bfecd",
    "200": "#43f7ae",
    "300": "#2adc97",
    "400": "#26ba7a",
    "500": "#22985f",
    "600": "#1b7e4d",
    "700": "#15673e",
    "800": "#185535",
    "900": "#19472d",
    "950": "#1a412b",
  },
  "violet": {
    "50": "#f8ecfe",
    "100": "#f2dcfd",
    "200": "#e6c6fc",
    "300": "#d2a5fd",
    "400": "#b07ffd",
    "500": "#895af9",
    "600": "#772def",
    "700": "#621dca",
    "800": "#5021a3",
    "900": "#412480",
    "950": "#3b276d",
  },
  "yellow": {
    "50": "#f4f89c",
    "100": "#ebef5c",
    "200": "#dadf2a",
    "300": "#c0c516",
    "400": "#b29f12",
    "500": "#a4790d",
    "600": "#905f08",
    "700": "#7b4905",
    "800": "#693b08",
    "900": "#59310d",
    "950": "#502e11",
  },
  "metadata": {
    "analogous30": [
      "indigo",
      "cyan",
    ],
    "analogous60": [
      "violet",
      "teal",
    ],
    "complementary": "orange",
    "input": "#60a5fa",
    "main": "blue",
  },
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
