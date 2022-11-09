import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  outDir: 'lib',
  noExternal: ["culori"],
  treeshake: true,
  minify: true,
})