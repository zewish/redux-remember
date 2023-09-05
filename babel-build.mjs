import url from 'node:url';
import path from 'node:path';
import fs from 'fs-extra';
import babel from '@babel/core';
import { glob } from 'glob';

const [, scriptName, envName] = process.argv;

if (envName !== 'es' && envName !== 'lib') {
  console.info(`Usage: node ${path.basename(scriptName)} <es/lib>`);
  process.exit(1);
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const SRC_DIR = `${__dirname}/src`;
const OUT_DIR = `${__dirname}/${envName}`;

(async () => {
  const files = await glob('**/*.ts{,x}', {
    cwd: SRC_DIR,
    absolute: true,
    nodir: true,
    ignore: '**/__tests__/**',
  });

  console.info(
    `Transpiling ${files.length} files in "${path.relative(__dirname, SRC_DIR)}" with babel...`
  );

  await Promise.all(files.map(async (filePath) => {
    const outputFileName = path
      .join(OUT_DIR, path.relative(SRC_DIR, filePath))
      .replace(/\.tsx?$/, '.js');

    await fs.mkdirp(path.dirname(outputFileName));

    const content = await fs.readFile(filePath, 'utf-8');
    const result = await babel.transformAsync(content, {
      cwd: __dirname,
      envName,
      babelrc: true,
      sourceMaps: true,
      sourceRoot: path.relative(
        path.dirname(outputFileName),
        SRC_DIR
      ),
      sourceFileName: path.relative(SRC_DIR, filePath),
      filename: filePath
    });

    if (result === null) {
      throw new Error('No code output from babel');
    }

    const mapFileName = outputFileName + '.map';

    await fs.writeFile(
      mapFileName,
      JSON.stringify(result.map),
      'utf8'
    );

    await fs.writeFile(
      outputFileName,
      `${result.code}\n//# sourceMappingURL=${path.basename(mapFileName)}`
    );
  }));

  console.info(`Wrote transpiled files to "${path.relative(__dirname, OUT_DIR)}".`);
})();
