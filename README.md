# Superpal

Create vivid UI palettes automatically from a single input color.

```js
npm i superpal
```

```js
import superPal from "superpal";
// or: const superPal = require("superpal").default;

superPal('#60a5fa')
// Returns a color object with 12 hues and a gray hue scale
```

Try it out: https://npm.runkit.com/superpal

## About

This is still very much work in progress and most likely has bugs and issues. The goal is to create palettes that would be similar in style and equally good in quality as hand tuned scales of, say, Tailwind, Chakra, Open Color, IBM Carbon, Next UI or Radix Colors.

Inspired by and borrowing the API, color scale names and a couple of color scale related helper functions from [Palx](https://github.com/jxnblk/palx).

What makes Superpal different from, say, Palx:

* Uses Okhsl (and HSLuv) color spaces for, hopefully, more vivid color interpolation
* Hue rotation/shifting to create more appealing scales

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