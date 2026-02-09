import fs from 'node:fs/promises';
import path from 'node:path';
import colors from 'picocolors';
import { fileExists, MIGRATIONS_DIR, replaceFileExtension } from '../utils/files.ts';
import { getVersionFromFileName, VERSION_FIELD, VERSION_TYPE_PREFIX } from '../utils/version.ts';
import type { RemigrateOptions } from '../config/index.ts';
import { formatTsCode } from '../utils/typescript.ts';
import { log } from '../utils/common.ts';

export const generateMigrationFile = async ({
  prevVersionFile,
  currVersionFile,
  storagePath,
  prettierOptions,
  tsImportExtension,
  headers,
}: Pick<
    RemigrateOptions,
    'storagePath' | 'prettierOptions' | 'tsImportExtension' | 'headers'
  > & {
  prevVersionFile: string;
  currVersionFile: string;
}): Promise<void> => {
  const prevVersion = getVersionFromFileName(prevVersionFile);
  const currVersion = getVersionFromFileName(currVersionFile);
  const filePath = `${storagePath}/${MIGRATIONS_DIR}/from_${prevVersion}${tsImportExtension}`;
  const fileName = path.basename(filePath);
  const getVersionType = (version: string) => `${VERSION_TYPE_PREFIX}${version}`;
  const fixExt = (filePath: string) => replaceFileExtension(
    path.basename(filePath),
    '.ts',
    tsImportExtension
  );

  if (await fileExists(filePath)) {
    log.skip(`Migration "${fileName}" already exists`);
    return;
  }

  await fs.writeFile(filePath, await formatTsCode({
    prettierOptions,
    code: `
      ${headers?.migrationFile ?? ''}
      import type { ${getVersionType(prevVersion)} } from '../versions/${fixExt(prevVersionFile)}';
      import type { ${getVersionType(currVersion)} } from '../versions/${fixExt(currVersionFile)}';

      export const from_${prevVersion} = (
        store: ${getVersionType(prevVersion)}
      ): ${getVersionType(currVersion)} => ({
        ...store,
        ${VERSION_FIELD}: '${currVersion}'
      });
    `
  }));

  log.success(`Created migration`);
  log.info(`  ${colors.dim('➜')} ${fileName}`);
};
