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
    strict: false,
    globals: {
      'redux': 'Redux'
    }
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
      babelConfig: './.babelrc.mjs',
      browserslist: false
    })
  ]
};

export default config;
