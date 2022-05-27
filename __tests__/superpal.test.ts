import superpal from '../src/index';

const gray = {
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
};

test("superpal", () => {
  expect(superpal("#07c")).toEqual(expect.objectContaining({
    gray
  }));
});
