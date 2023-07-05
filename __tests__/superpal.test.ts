import superpal from '../src/index';

test("superpal (no args)", () => {
  expect(superpal("#60a5fa")).toMatchSnapshot();
});

test("superpal many args (hsl)", () => {
  expect(superpal("#60a5fa", {colorSpace:"hsl"})).toMatchSnapshot();
});

test("superpal many args (hsluv)", () => {
  expect(superpal("#60a5fa", {colorSpace:"hsluv"})).toMatchSnapshot();
});

test("superpal without scales", () => {
  expect(superpal("#60a5fa", {returnFullPalette:false})).toMatchSnapshot();
});

test("superpal without any saturation", () => {
  expect(superpal("#888888")).toMatchSnapshot();
});

test("superpal for black", () => {
  expect(superpal("#000000")).toMatchSnapshot();
});