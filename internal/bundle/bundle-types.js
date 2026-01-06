#!/usr/bin/env node

import { execSync } from 'child_process';
import process from 'node:process';

const usage = () => {
  console.error(`Usage: ${process.argv[1]} <tsconfig.json> <outDir>`);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length !== 2) {
  usage();
}

const [tsconfigPath, outDir] = args;

execSync(
  `tsc -p ${tsconfigPath}
    --pretty
    --declaration
    --declarationMap
    --emitDeclarationOnly
    --outDir ${outDir}
  `.replace(/\n+/gm, ''),
  {
    env: {
      ...process.env,
    },
    cwd: process.cwd(),
    stdio: 'inherit',
  }
);
