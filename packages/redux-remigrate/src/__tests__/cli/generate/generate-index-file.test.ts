import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import { generateIndexFile } from '../../../cli/generate/generate-index-file.ts';
import { listTsFiles, MIGRATIONS_DIR, VERSIONS_DIR } from '../../../cli/utils/files.ts';
import { VERSION_TYPE_PREFIX } from '../../../cli/utils/version.ts';
import { formatTsCode } from '../../../cli/utils/typescript.ts';
import { extractTypeVersion } from '../../../cli/utils/type-helper.ts';
import { log } from '../../../cli/utils/common.ts';
import { DEFAULT_PRETTIER_OPTS } from '../../../cli/config/prettier.ts';

vi.mock('node:fs/promises');
vi.mock('../../../cli/utils/type-helper.ts');
vi.mock('../../../cli/utils/common.ts');

vi.mock('../../../cli/utils/files.ts', async (importOriginal) => ({
  ...await importOriginal(),
  listTsFiles: vi.fn(),
}));

vi.mock('../../../cli/utils/typescript.ts', async (importOriginal) => ({
  ...await importOriginal(),
  formatTsCode: vi.fn(),
}));

describe('cli/generate/generate-index-file.ts', () => {
  const storagePath = '/awesome/storage/path';
  const opts: Parameters<typeof generateIndexFile>[0] = {
    storagePath,
    tsCompilerOptions: { skipLibCheck: true },
    prettierOptions: DEFAULT_PRETTIER_OPTS,
    tsImportExtension: '.ts',
    headers: undefined,
  };

  const version1 = '20250614_100000';
  const version2 = '20250615_120000';
  const versionFile1 = `${storagePath}/${VERSIONS_DIR}/${version1}_state.ts`;
  const versionFile2 = `${storagePath}/${VERSIONS_DIR}/${version2}_state.ts`;
  const migrationFile = `${storagePath}/${MIGRATIONS_DIR}/from_${version1}.ts`;

  const mockListTsFiles = vi.mocked(listTsFiles);
  const mockExtractTypeVersion = vi.mocked(extractTypeVersion);
  const mockWriteFile = vi.mocked(fs.writeFile).mockResolvedValue();
  const mockFormatTsCode = vi.mocked(formatTsCode).mockImplementation(
    ({ code }) => Promise.resolve(code)
  );

  const getFormattedCode = () => mockFormatTsCode.mock.calls[0][0].code;

  beforeEach(() => {
    mockListTsFiles.mockImplementation((dir: string) => {
      if (dir.includes(VERSIONS_DIR)) {
        return Promise.resolve([versionFile2, versionFile1]);
      }

      if (dir.includes(MIGRATIONS_DIR)) {
        return Promise.resolve([migrationFile]);
      }

      return Promise.resolve([]);
    });

    mockExtractTypeVersion
      .mockResolvedValueOnce(`'${version1}'`)
      .mockResolvedValueOnce(`'${version2}'`);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateIndexFile()', () => {
    it('creates index file using the correct path', async () => {
      await generateIndexFile(opts);

      expect(mockWriteFile).toHaveBeenCalledWith(
        `${storagePath}/index.ts`,
        expect.any(String)
      );
    });

    it('generates index with migrator imports and createRemigrate call', async () => {
      await generateIndexFile(opts);

      expect(getFormattedCode()).toContain(
        `import { from_${version1} } from './migrations/from_${version1}${opts.tsImportExtension}'`
      );
      expect(getFormattedCode()).toContain('createRemigrate');
      expect(getFormattedCode()).toContain(`migrators:`);
      expect(getFormattedCode()).toContain(`from_${version1}`);
    });

    it('extracts first and latest versions from version files', async () => {
      await generateIndexFile(opts);

      expect(mockExtractTypeVersion).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: versionFile1,
          typeExpression: `${VERSION_TYPE_PREFIX}${version1}`,
        })
      );

      expect(mockExtractTypeVersion).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: versionFile2,
          typeExpression: `${VERSION_TYPE_PREFIX}${version2}`,
        })
      );

      expect(getFormattedCode()).toContain(`firstVersion: '${version1}'`);
      expect(getFormattedCode()).toContain(`latestVersion: '${version2}'`);
    });

    it('uses empty string versions when no version files exist', async () => {
      mockListTsFiles.mockResolvedValue([]);

      await generateIndexFile(opts);

      expect(getFormattedCode()).toContain(`firstVersion: ''`);
      expect(getFormattedCode()).toContain(`latestVersion: ''`);
    });

    it('logs success message when logging is enabled', async () => {
      await generateIndexFile(opts, true);
      expect(log.success).toHaveBeenCalledWith('Regenerated index file');
    });

    it('does not log when logging is disabled', async () => {
      await generateIndexFile(opts, false);
      expect(log.success).not.toHaveBeenCalled();
    });

    it('includes header in index file when provided', async () => {
      const header = '// Custom header\n';
      await generateIndexFile({
        ...opts,
        headers: { indexFile: header },
      });

      expect(getFormattedCode()).toContain(header);
    });

    it('includes auto-generated warning comment', async () => {
      await generateIndexFile(opts);
      expect(getFormattedCode()).toContain('AUTO-GENERATED FILE - DO NOT EDIT');
    });

    it('uses tsImportExtension for migration imports', async () => {
      await generateIndexFile({
        ...opts,
        tsImportExtension: '.js',
      });

      expect(getFormattedCode()).toContain(`from_${version1}.js`);
    });
  });
});
