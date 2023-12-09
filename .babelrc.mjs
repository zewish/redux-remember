import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const browsers = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9'
];

const getPresets = ({
  modules,
  targets = { browsers }
} = {}) => [
  require.resolve('@babel/preset-typescript'),
  [require.resolve('@babel/preset-env'), {
    modules,
    targets,
    exclude: ['@babel/plugin-transform-regenerator']
  }]
];

export default {
  plugins: [
    [require.resolve('@babel/plugin-proposal-object-rest-spread'), {
      useBuiltIns: true
    }]
  ],
  presets: getPresets(),
  env: {
    cjs: {
      presets: getPresets({ modules: 'commonjs' }),
      plugins: [
        [require.resolve('babel-plugin-module-extension-resolver'), {
          dstExtension: '.cjs'
        }]
      ]
    },
    mjs: {
      presets: getPresets({ modules: false }),
      plugins: [
        [require.resolve('babel-plugin-module-extension-resolver'), {
          dstExtension: '.mjs'
        }]
      ]
    },
    test: {
      presets: getPresets({
        targets: { node: 'current' }
      })
    }
  }
}
