import superpal from '../src/index';

test("superpal", () => {
  console.log(superpal("#60a5fa"));
  expect(superpal("#60a5fa")).toMatchSnapshot();
});