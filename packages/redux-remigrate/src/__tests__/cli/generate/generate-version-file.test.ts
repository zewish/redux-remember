import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import { generateVersionFile } from '../../../cli/generate/generate-version-file.ts';
import { listTsFiles, VERSIONS_DIR } from '../../../cli/utils/files.ts';
import {
  areTypesDifferent,
  extractType,
  extractTypeFromVersionFile,
  extractTypeVersion,
} from '../../../cli/utils/type-helper.ts';
import {
  newMigrationVersion,
  VERSION_FIELD,
  VERSION_TYPE_PREFIX
} from '../../../cli/utils/version.ts';
import { RemigrateCliError, log } from '../../../cli/utils/common.ts';

vi.mock('node:fs/promises');
vi.mock('../../../cli/utils/common.ts', async (importOriginal) => ({
  ...await importOriginal(),
  log: {
    info: vi.fn(),
    success: vi.fn(),
  }
}));
vi.mock('../../../cli/utils/type-helper.ts');
vi.mock('../../../cli/utils/files.ts', async (importOriginal) => ({
  ...await importOriginal(),
  listTsFiles: vi.fn(),
}));
vi.mock('../../../cli/utils/version.ts', async (importOriginal) => ({
  ...await importOriginal(),
  newMigrationVersion: vi.fn(),
}));

describe('cli/generate/generate-version-file.ts', () => {
  const storagePath = '/my/storage/path';
  const version = '20250615_120000';
  const typeFileSuffix = '-v1';
  const opts: Parameters<typeof generateVersionFile>[0] = {
    storagePath,
    stateFilePath: './src/state/index.ts',
    stateTypeExpression: 'MyPresistedState',
    tsCompilerOptions: { skipLibCheck: true },
    tsImportExtension: '.ts',
    prettierOptions: {},
    typeFileSuffix,
    headers: undefined,
  };

  const mockExtractTypeFromVersionFile = vi.mocked(extractTypeFromVersionFile);
  const mockAreTypesDifferent = vi.mocked(areTypesDifferent);
  const mockNewMigrationVersion = vi.mocked(newMigrationVersion);
  const mockExtractType = vi.mocked(extractType);
  const mockExtractTypeVersion = vi.mocked(extractTypeVersion);
  const mockListTsFiles = vi.mocked(listTsFiles);
  const mockWriteFile = vi.mocked(fs.writeFile);

  beforeEach(() => {
    mockNewMigrationVersion.mockReturnValue(version);
    mockExtractType.mockResolvedValue('{ name: string }');
    mockExtractTypeVersion.mockResolvedValue(`'${version}'`);
    mockListTsFiles.mockResolvedValue([]);
    mockWriteFile.mockResolvedValue();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateVersionFile()', () => {
    it('creates a new version file when no previous version exists', async () => {
      expect(await generateVersionFile(opts)).toBe(true);
      expect(mockWriteFile).toHaveBeenCalledWith(
        `${storagePath}/${VERSIONS_DIR}/${version}${typeFileSuffix}.ts`,
        `export type ${VERSION_TYPE_PREFIX}${version} = { name: string }`
      );
      expect(log.success).toHaveBeenCalledWith('Created version snapshot');
    });

    it('creates a new version file when types are different from previous', async () => {
      const prevVersionFile = `${storagePath}/${VERSIONS_DIR}/20250614_100000${typeFileSuffix}.ts`;

      mockListTsFiles.mockResolvedValue([prevVersionFile]);
      mockExtractTypeFromVersionFile.mockResolvedValue('{ id: number }');
      mockAreTypesDifferent.mockResolvedValue(true);

      expect(await generateVersionFile(opts)).toBe(true);
      expect(mockExtractTypeFromVersionFile).toHaveBeenCalledWith(
        expect.objectContaining({ versionFilePath: prevVersionFile })
      );

      expect(mockAreTypesDifferent).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('returns false when types are the same as previous version', async () => {
      mockListTsFiles.mockResolvedValue([
        `${storagePath}/${VERSIONS_DIR}/20250614_100000${typeFileSuffix}.ts`
      ]);

      mockExtractTypeFromVersionFile.mockResolvedValue('{ name: string }');
      mockAreTypesDifferent.mockResolvedValue(false);

      expect(await generateVersionFile(opts)).toBe(false);
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('throws RemigrateCliError when version field is missing from state type', async () => {
      mockExtractTypeVersion.mockResolvedValue(false);

      await expect(generateVersionFile(opts)).rejects.toThrow(new RemigrateCliError(
        `Missing "${VERSION_FIELD}" key in store type. To fix this ensure the following is done:\n`
        + `1. Add "${VERSION_FIELD}" to your persisted keys\n`
        + `2. Add the "${VERSION_FIELD}" reducer to your reducers list\n`
      ));
    });

    it('adds header to version file when provided', async () => {
      const header = '// Extra header';

      await generateVersionFile({
        ...opts,
        headers: { versionFile: header },
      });

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(new RegExp(`^${header}`))
      );
    });

    it('does not add typeFileSuffix when not provided', async () => {
      await generateVersionFile({
        ...opts,
        typeFileSuffix: ''
      });

      expect(mockWriteFile).toHaveBeenCalledWith(
        `${storagePath}/${VERSIONS_DIR}/${version}.ts`,
        expect.any(String)
      );
    });
  });
});
