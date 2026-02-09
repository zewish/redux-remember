#!/usr/bin/env node

const process = require('node:process');
const path = require('node:path');
const { existsSync, readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const colors = require('picocolors');

const isESM = () => {
  let dir = process.cwd();
  while (dir !== '/') {
    const pkgPath = `${dir}/package.json`;
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        return pkg.type === 'module';
      } catch {
        return false;
      }
    }
    dir = path.resolve(`${dir}/..`);
  }
  return false;
};

/**
 * @param {string} moduleName
 */
const checkInstalled = (moduleName) => {
  const require = createRequire(`${process.cwd()}/package.json`);

  try {
    require.resolve(moduleName);
  } catch {
    return false;
  }

  return true;
};

(async () => {
  if (!checkInstalled('typescript')) {
    console.error(
      colors.yellow('⚠'),
      colors.bold('Missing dependency:'),
      'TypeScript is required for the remigrate CLI to work.',
      '\n\n Install typescript in your project and then try again:',
      colors.cyan('\n npm install --save-dev typescript && npx remigrate'),
      '\n'
    );

    process.exit(1);
  }

  const { runCli } = await import(
    isESM()
      ? '../dist/mjs/cli/index.mjs'
      : '../dist/cjs/cli/index.cjs'
  );

  await runCli();
})();
