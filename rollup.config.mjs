import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: './src/index.ts',
  output: {
    file: './dist/redux-remember.js',
    name: 'ReduxRemember',
    exports: 'named',
    sourcemap: true,
    format: 'umd',
    esModule: false,
    strict: false
  },
  external: ['redux'],
  plugins: [
    resolve({
      mainFields: [
        'module',
        'jsnext:main',
        'main'
      ]
    }),
    commonjs(),
    ts({
      transpiler: 'babel',
      babelConfig: `./.babelrc`,
      hook: {
        outputPath(path, kind) {
          if (kind === 'declaration') {
            return `./index.d.ts`;
          }

          return path;
        }
      }
    })
  ]
};

export default config;
