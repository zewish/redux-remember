import { createRequire } from 'module'
const require = createRequire(import.meta.url);

export default {
  presets: [
    require.resolve('@babel/preset-react'),
    [require.resolve('@babel/preset-env'), {
      useBuiltIns: 'entry',
      corejs: 3,
      modules: false,
      loose: true,
      targets: {
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR'
        ]
      }
    }]
  ]
};
