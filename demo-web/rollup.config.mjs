import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

process.env.NODE_ENV = 'development';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: './src/index.tsx',
  context: 'window',
  output: {
    file: `./bundle.js`,
    format: 'iife',
    exports: 'named',
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'redux': 'Redux',
      'react-redux': 'ReactRedux',
      'redux-remember': 'ReduxRemember',
      '@reduxjs/toolkit': 'RTK'
    }
  },
  external: [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'redux-remember',
    '@reduxjs/toolkit'
  ],
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
      babelConfig: `./.babelrc`
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
    })
  ]
};

export default config;
