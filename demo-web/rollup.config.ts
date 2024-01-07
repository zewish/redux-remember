import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import process from 'node:process';
import { RollupOptions } from 'rollup';

process.env.NODE_ENV = 'development';

const config: RollupOptions = {
  input: './src/index.tsx',
  context: 'window',
  output: {
    file: `./bundle.js`,
    sourcemap: true,
    format: 'iife'
  },
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
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
    }),
    terser({
      parse: {
        ecma: 2020
      },
      compress: {
        ecma: 5,
        comparisons: false,
        inline: 2
      },
      mangle: {
        safari10: true
      },
      keep_classnames: false,
      keep_fnames: false,
      ie8: false,
      output: {
        ecma: 5,
        comments: false,
        ascii_only: true
      }
    })
  ]
};

export default config;
