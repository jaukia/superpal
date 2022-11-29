import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  outDir: 'lib',
  noExternal: ["culori"],
  treeshake: true,
  minify: true,
  /*footer: {
    // See: https://github.com/egoist/tsup/issues/710#issuecomment-1244914755
    // and: https://github.com/egoist/tsup/issues/572#issuecomment-1060599574
    js: 'module.exports = module.exports.default;'
  }*/
})