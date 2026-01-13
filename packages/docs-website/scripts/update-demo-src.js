#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const demoMdxPath = `${import.meta.dirname}/../src/content/docs/demo/index.mdx`;
const bundleFile = readdirSync(`${import.meta.dirname}/../public`)
  .find((file) => file.startsWith('demo-bundle-'));

if (!bundleFile) {
  throw new Error('Bundle file not found');
}

const code = readFileSync(demoMdxPath, 'utf-8');
writeFileSync(demoMdxPath, code.replace(
  /<script src="\/demo-bundle-[^"]+\.js"><\/script>/,
  `<script src="/${bundleFile}"></script>`
));
