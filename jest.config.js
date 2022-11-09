module.exports = {
  verbose: true,
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
};
