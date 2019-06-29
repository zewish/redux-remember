const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');

process.env.NODE_ENV = 'development';

module.exports = {
    input: './src/index.js',
    output: {
        file: `${__dirname}/bundle.js`,
        format: 'iife',
        exports: 'named',
        globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'redux': 'Redux',
            'react-redux': 'ReactRedux',
            'redux-remember': 'ReduxRemember'
        }
    },
    plugins: [
        resolve(),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**'
        })
    ],
    external: [
        'react',
        'react-dom',
        'redux',
        'react-redux',
        'redux-remember'
    ]
};
