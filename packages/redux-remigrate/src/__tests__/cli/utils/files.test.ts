import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import fs from 'node:fs/promises';
import {
  MIGRATIONS_DIR,
  VERSIONS_DIR,
  listTsFiles,
  replaceFileExtension,
  ensureStoragePath,
  fileExists,
} from '../../../cli/utils/files.ts';

vi.mock('node:fs/promises');

describe('cli/utils/files.ts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockDirPath = '/some/dir';
  const readdirMock = vi.mocked(fs.readdir) as unknown as Mock<
    () => Promise<string[]>
  >;

  describe('constants', () => {
    it('exports MIGRATIONS_DIR', () => {
      expect(MIGRATIONS_DIR).toBe('migrations');
    });

    it('exports VERSIONS_DIR', () => {
      expect(VERSIONS_DIR).toBe('versions');
    });
  });

  describe('listTsFiles()', () => {
    it('returns only .ts files from directory', async () => {
      readdirMock.mockResolvedValue([
        'file1.ts',
        'file2.js',
        'file3.ts',
        'readme.md',
      ]);

      const result = await listTsFiles(mockDirPath);

      expect(readdirMock).toHaveBeenCalledWith(mockDirPath, { recursive: false });
      expect(result).toEqual([
        `${mockDirPath}/file3.ts`,
        `${mockDirPath}/file1.ts`
      ]);
    });

    it('sorts files in descending numeric order', async () => {
      readdirMock.mockResolvedValue([
        '1_first.ts',
        '10_tenth.ts',
        '2_second.ts',
      ]);

      expect(await listTsFiles(mockDirPath)).toEqual([
        `${mockDirPath}/10_tenth.ts`,
        `${mockDirPath}/2_second.ts`,
        `${mockDirPath}/1_first.ts`,
      ]);
    });

    it('returns empty array when no .ts files exist', async () => {
      readdirMock.mockResolvedValue([
        'file.js',
        'file.json',
      ]);

      expect(await listTsFiles(mockDirPath)).toEqual([]);
    });
  });

  describe('replaceFileExtension()', () => {
    it('replaces file extension at end of path', () => {
      const result = replaceFileExtension('/path/to/file.ts', '.ts', '.js');
      expect(result).toBe('/path/to/file.js');
    });

    it('only replaces extension at end of path', () => {
      const result = replaceFileExtension('/path/.ts/file.ts', '.ts', '.js');
      expect(result).toBe('/path/.ts/file.js');
    });

    it('returns unchanged path if extension does not match', () => {
      const result = replaceFileExtension('/path/to/file.js', '.ts', '.mjs');
      expect(result).toBe('/path/to/file.js');
    });
  });

  describe('ensureStoragePath()', () => {
    it('creates migrations and versions directories', async () => {
      const storagePath = '/storage';
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      await ensureStoragePath(storagePath);

      expect(fs.mkdir).toHaveBeenCalledTimes(2);
      expect(fs.mkdir).toHaveBeenCalledWith(`${storagePath}/migrations`, { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith(`${storagePath}/versions`, { recursive: true });
    });
  });

  describe('fileExists()', () => {
    const statMock = vi.mocked(fs.stat) as unknown as Mock<(filePath: string) => ({
      isFile(): boolean;
    })>;

    it('returns true when file exists', async () => {
      statMock.mockResolvedValue({ isFile: () => true });
      const result = await fileExists('/path/to/file.ts');

      expect(statMock).toHaveBeenCalledWith('/path/to/file.ts');
      expect(result).toBe(true);
    });

    it('returns false when path is a directory', async () => {
      statMock.mockResolvedValue({ isFile: () => false });
      expect(await fileExists('/path/to/dir')).toBe(false);
    });

    it('returns false when file does not exist', async () => {
      statMock.mockRejectedValue(new Error('ENOENT'));
      expect(await fileExists('/path/to/non-existent.ts')).toBe(false);
    });
  });
});
