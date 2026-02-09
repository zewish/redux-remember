#!/usr/bin/env node

const process = require('node:process');
const { createRequire } = require('node:module');
const colors = require('picocolors');

const { resolve } = createRequire(`${process.cwd()}/package.json`);

/**
 * @param {string} moduleName
 */
const checkInstalled = (moduleName) => {
  try {
    resolve(moduleName);
  } catch {
    return false;
  }

  return true;
};

if (!checkInstalled('redux-remigrate')) {
  console.error(
    colors.yellow('⚠'),
    colors.bold('Missing dependency:'),
    'Redux Remigrate is required for the remigrate CLI wrapper to work.',
    '\n\n Install redux-remigrate in your project and then try again:',
    colors.cyan('\n npm install redux-remigrate && npx remigrate'),
    '\n'
  );

  process.exit(1);
}

import(
  resolve('redux-remigrate/bin/remigrate.cjs')
);
