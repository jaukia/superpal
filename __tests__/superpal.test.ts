import superpal from '../src/index';

test("superpal (no args)", () => {
  expect(superpal("#60a5fa")).toMatchSnapshot();
});

test("superpal many args (hsl)", () => {
  expect(superpal("#60a5fa", true, true, "hsl", 60.0)).toMatchSnapshot();
});

test("superpal many args (hsluv)", () => {
  expect(superpal("#60a5fa", true, true, "hsluv", 60.0)).toMatchSnapshot();
});