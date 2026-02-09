import type { RemigrateOptions } from './config/index.ts';
import { create } from './create.ts';
import { generateIndexFile } from './generate/generate-index-file.ts';
import { ensureStoragePath, listTsFiles, VERSIONS_DIR } from './utils/files.ts';
import { log } from './utils/common.ts';

export const init = async (
  options: RemigrateOptions & { typeFileSuffix: string }
): Promise<void> => {
  await ensureStoragePath(options.storagePath);
  await generateIndexFile(options, false);

  const versions = await listTsFiles(
    `${options.storagePath}/${VERSIONS_DIR}`
  );

  if (versions.length) {
    log.skip('Already initialized');
    return;
  }

  await create(options);
  await generateIndexFile(options);
};
