// const babel = require('rollup-plugin-babel');
import ts from '@wessberg/rollup-plugin-ts';
// import resolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';

// process.env.NODE_ENV = 'development';

export default {
  input: './src/index.ts',
  output: {
    name: 'ReduxRemember',
    exports: 'named',
    // sourcemap: true,

    format: 'cjs',
    strict: false,
    interop: false,
  },
  external: [
    'redux'
  ],
    // globals: {
    //   'redux': 'Redux'
    // },
  plugins: [
    ts({
      tsconfig: `${__dirname}/tsconfig.json`
    })

    // ts({
    //   transpiler: 'babel'
    // }),

    // resolve({
    //   mainFields: [
    //     'module',
    //     'jsnext:main',
    //     'main'
    //   ]
    // }),

    // commonjs()

    // babel({
    //   exclude: 'node_modules/**'
    // })
  ]
  // plugins: [
  //   ts({
  //     hook: {
  //       outputPath(path, kind) {
  //         if (kind === 'declaration') {
  //           return `${__dirname}/oget.d.ts`;
  //         }

  //         return path;
  //       }
  //     }
  //   })
  // ]
};
