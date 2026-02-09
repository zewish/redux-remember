import fs from 'node:fs/promises';

export const MIGRATIONS_DIR = 'migrations';
export const VERSIONS_DIR = 'versions';

export const listTsFiles = async (dir: string) => (await fs.readdir(dir, { recursive: false }))
  .filter((file) => file.endsWith('.ts'))
  .map((file) => `${dir}/${file}`)
  .sort((fileA, fileB) => fileB.localeCompare(
    fileA,
    undefined,
    { numeric: true }
  ));

export const replaceFileExtension = (path: string, oldExt: string, newExt: string) => path.replace(
  new RegExp(`\\${oldExt}$`),
  newExt
);

export const ensureStoragePath = async (storagePath: string) => {
  await fs.mkdir(`${storagePath}/${MIGRATIONS_DIR}`, { recursive: true });
  await fs.mkdir(`${storagePath}/${VERSIONS_DIR}`, { recursive: true });
};

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
};
