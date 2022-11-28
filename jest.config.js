/* cargo-culted from here, and seems to work
https://stackoverflow.com/a/71545273/676798
*/
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: "node",
  transformIgnorePatterns: [
      "node_modules/(?!culori/.*)",
  ],
};
