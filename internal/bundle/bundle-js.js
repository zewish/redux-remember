#!/usr/bin/env node

import { execSync } from 'child_process';
import process from 'node:process';

const usage = () => {
  console.error(`Usage: ${process.argv[1]} <cjs|mjs> <src> <outDir>`);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length !== 3) {
  usage();
}

const [bundleType, src, outDir] = args;

switch (bundleType) {
  case 'cjs':
  case 'mjs':
    break;
  default:
    console.error("Error: bundle type must be 'cjs' or 'mjs'");
    usage();
}

execSync(
  `babel --config-file ${import.meta.dirname}/babel.config.ts
    ${src}
    --out-dir ${outDir}
    --extensions '.ts'
    --source-maps
    --out-file-extension '.${bundleType}'
  `.replace(/\n+/gm, ''),
  {
    env: {
      ...process.env,
      BABEL_ENV: bundleType
    },
    cwd: process.cwd(),
    stdio: 'inherit',
  }
);
