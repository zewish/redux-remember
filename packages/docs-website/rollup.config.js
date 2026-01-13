import ts from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import process from 'node:process';

process.env.NODE_ENV = 'production';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: './src/demo/index.tsx',
  context: 'window',
  output: {
    dir: './public',
    entryFileNames: 'demo-bundle-[hash].js',
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
      tsconfig: './tsconfig.demo.json',
      sourceMap: true
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
