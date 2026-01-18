import { type Options } from '@babel/preset-env';
import { type TransformOptions } from '@babel/core';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.filename);

const browsers = [
  '>1%',
  'last 4 versions',
  'Firefox ESR'
];

const getPresets = ({
  modules,
  targets = { browsers }
}: Partial<Options> = {}) => [
  require.resolve('@babel/preset-typescript'),
  [require.resolve('@babel/preset-env'), {
    modules,
    targets,
    loose: true,
    exclude: ['@babel/plugin-transform-regenerator']
  }]
];

const config: TransformOptions = {
  plugins: [
    [require.resolve('@babel/plugin-transform-object-rest-spread'), {
      useBuiltIns: true
    }]
  ],
  presets: getPresets(),
  env: {
    cjs: {
      presets: getPresets({ modules: 'commonjs' }),
      plugins: [
        [require.resolve('babel-plugin-replace-import-extension'), {
          "extMapping": { ".ts": ".cjs" }
        }]
      ]
    },
    mjs: {
      presets: getPresets({ modules: false }),
      plugins: [
        [require.resolve('babel-plugin-replace-import-extension'), {
          "extMapping": { ".ts": ".mjs" }
        }]
      ]
    },
    test: {
      presets: getPresets({
        targets: { node: 'current' }
      })
    }
  }
};

export default config;
