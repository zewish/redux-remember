import path from 'node:path';
import { RemigrateCliError } from './common.ts';

const VERSION_EXTRACT_REGEX = /^\d{8}_\d{6}/;

export const VERSION_TYPE_PREFIX = 'RemigrateStore_';
export const VERSION_FIELD = '_remigrateVersion';

export const newMigrationVersion = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const getVersionFromFileName = (fileName: string): string => {
  const baseName = path.basename(fileName);
  const match = baseName.match(VERSION_EXTRACT_REGEX);

  if (!match) {
    throw new RemigrateCliError(`Could not extract version from file name "${baseName}"`)
  }

  return match[0];
};
