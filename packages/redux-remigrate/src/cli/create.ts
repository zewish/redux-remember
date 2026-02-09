import { RemigrateCliError, log } from './utils/common.ts';
import {
  ensureStoragePath,
  fileExists,
  listTsFiles,
  VERSIONS_DIR
} from './utils/files.ts';
import { generateIndexFile } from './generate/generate-index-file.ts';
import { generateMigrationFile } from './generate/generate-migration-file.ts';
import { generateVersionFile } from './generate/generate-version-file.ts';
import type { RemigrateOptions } from './config/index.ts';

export const create = async (
  options: RemigrateOptions & { typeFileSuffix: string }
): Promise<void> => {
  await ensureStoragePath(options.storagePath);

  if (!await fileExists(options.stateFilePath)) {
    throw new RemigrateCliError(
      'State file not found. Verify that "stateFilePath" points to an existing file.'
    );
  }

  if (!await generateVersionFile(options)) {
    log.skip('Store type unchanged');
    return;
  }

  const [currVersionFile, prevVersionFile] = await listTsFiles(
    `${options.storagePath}/${VERSIONS_DIR}`
  );

  if (!currVersionFile) {
    throw new RemigrateCliError('Failed to write version file (check permissions)');
  }

  if (!prevVersionFile) {
    log.skip('Single store version, migration not needed');
    return;
  }

  await generateMigrationFile({
    ...options,
    prevVersionFile,
    currVersionFile
  });

  await generateIndexFile(options);
};
