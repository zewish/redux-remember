const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

process.env.NODE_ENV = 'development';

module.exports = {
    input: './src/index.js',
    output: {
        file: `${__dirname}/dist/redux-remember.js`,
        name: 'ReduxRemember',
        sourcemap: true,
        exports: 'named',
        globals: {
            'redux': 'Redux'
        }
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
        babel({
            exclude: 'node_modules/**'
        })
    ],
    external: [
        'redux'
    ]
};
