import ts from '@wessberg/rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './src/index.ts',
  output: {
    name: 'ReduxRemember',
    exports: 'named',
    sourcemap: true,
    interop: false,
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
      babelConfig: `${__dirname}/.babelrc`,
      hook: {
        outputPath(path, kind) {
          if (kind === 'declaration') {
            return `${__dirname}/index.d.ts`;
          }

          return path;
        }
      }
    })
  ]
};
