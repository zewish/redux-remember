import fs from 'node:fs/promises';
import path from 'node:path';
import colors from 'picocolors';
import { RemigrateCliError, log } from '../utils/common.ts';
import type { RemigrateOptions } from '../config/index.ts';
import { listTsFiles, VERSIONS_DIR } from '../utils/files.ts';
import {
  areTypesDifferent,
  extractType,
  extractTypeFromVersionFile,
  extractTypeVersion,
} from '../utils/type-helper.ts';
import { newMigrationVersion, VERSION_FIELD, VERSION_TYPE_PREFIX } from '../utils/version.ts';

export const generateVersionFile = async ({
  headers,
  typeFileSuffix,
  ...commonOpts
}: RemigrateOptions & { typeFileSuffix: string }): Promise<boolean> => {
  const [prevVersionFilePath] = await listTsFiles(`${commonOpts.storagePath}/${VERSIONS_DIR}`);
  const prevType = prevVersionFilePath && (await extractTypeFromVersionFile({
    ...commonOpts,
    versionFilePath: prevVersionFilePath,
  }));

  const currVersion = newMigrationVersion();
  const currType = await extractType({
    ...commonOpts,
    version: currVersion,
  });

  if (!await extractTypeVersion({
    filePath: commonOpts.stateFilePath,
    typeExpression: commonOpts.stateTypeExpression,
    ...commonOpts
  })) {
    throw new RemigrateCliError(
      `Missing "${VERSION_FIELD}" key in store type. To fix this ensure the following is done:\n`
      + `1. Add "${VERSION_FIELD}" to your persisted keys\n`
      + `2. Add the "${VERSION_FIELD}" reducer to your reducers list\n`
    );
  }

  if (prevType && !await areTypesDifferent(currType, prevType, commonOpts.tsCompilerOptions)) {
    return false;
  }

  const versionFileName = `${currVersion}${path.basename(typeFileSuffix)}.ts`;

  await fs.writeFile(
    `${commonOpts.storagePath}/${VERSIONS_DIR}/${versionFileName}`,
    [headers?.versionFile ?? '', `export type ${VERSION_TYPE_PREFIX}${currVersion} = ${currType}`]
      .filter(Boolean)
      .join('\n')
  );

  log.success('Created version snapshot');
  log.info(`  ${colors.dim('➜')} ${versionFileName}`);

  return true;
};
