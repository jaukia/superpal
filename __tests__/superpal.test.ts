import superpal from '../src/index';

test("superpal", () => {
  expect(superpal("#60a5fa")).toMatchSnapshot();
});