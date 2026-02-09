import path from 'node:path';
import fs from 'node:fs/promises';
import { listTsFiles, MIGRATIONS_DIR, VERSIONS_DIR } from '../utils/files.ts';
import { getVersionFromFileName, VERSION_TYPE_PREFIX } from '../utils/version.ts';
import { formatTsCode } from '../utils/typescript.ts';
import { extractTypeVersion } from '../utils/type-helper.ts';
import type { RemigrateOptions } from '../config/index.ts';
import { log } from '../utils/common.ts';

export const generateIndexFile = async (
  {
    storagePath,
    tsCompilerOptions,
    prettierOptions,
    tsImportExtension,
    headers,
  }: Pick<
    RemigrateOptions,
    'storagePath' | 'tsImportExtension' | 'prettierOptions' | 'tsCompilerOptions' | 'headers'
  >,
  enableLogging = true
): Promise<void> => {
  const files = await listTsFiles(`${storagePath}/${VERSIONS_DIR}`);
  const firstVersion = files.length
    ? await extractTypeVersion({
      filePath: files[files.length - 1],
      typeExpression: `${VERSION_TYPE_PREFIX}${getVersionFromFileName(files[files.length - 1])}`,
      tsCompilerOptions
    })
    : "''";

  const latestVersion = files.length
    ? await extractTypeVersion({
      filePath: files[0],
      typeExpression: `${VERSION_TYPE_PREFIX}${getVersionFromFileName(files[0])}`,
      tsCompilerOptions
    })
    : "''";

  const migrators = (await listTsFiles(`${storagePath}/${MIGRATIONS_DIR}`)).map(
    (filePath) => path.basename(filePath, '.ts')
  );

  const code = `
    /**
     * ⚠ WARNING: AUTO-GENERATED FILE - DO NOT EDIT
     * This file is managed by Redux Remigrate and will be overwritten on creation of new migrations.
     * If you deleted any of your old migrations, run "redux-remigrate cleanup" to regenerate.
     **/
    ${headers?.indexFile ?? ''}
    import { createRemigrate } from '../redux-remigrate/index.ts'; // @TODO: change this before release
    ${migrators
      .map((name) => `import { ${name} } from './migrations/${name}${tsImportExtension}';`)
      .join('\n')
    }

    export const migrate = createRemigrate({
      firstVersion: ${firstVersion},
      latestVersion: ${latestVersion},
      migrators: {
        ${migrators.join(',\n')}
      }
    });
  `;

  await fs.writeFile(`${storagePath}/index.ts`, await formatTsCode({
    prettierOptions,
    code
  }));

  if (enableLogging) {
    log.success('Regenerated index file');
  }
};
