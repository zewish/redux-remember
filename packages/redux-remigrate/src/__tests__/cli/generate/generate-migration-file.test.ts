import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import { generateMigrationFile } from '../../../cli/generate/generate-migration-file.ts';
import { fileExists, MIGRATIONS_DIR } from '../../../cli/utils/files.ts';
import { VERSION_FIELD, VERSION_TYPE_PREFIX } from '../../../cli/utils/version.ts';
import { formatTsCode } from '../../../cli/utils/typescript.ts';
import { log } from '../../../cli/utils/common.ts';
import { DEFAULT_PRETTIER_OPTS } from '../../../cli/config/prettier.ts';

vi.mock('node:fs/promises');
vi.mock('../../../cli/utils/common.ts');

vi.mock('../../../cli/utils/files.ts', async (importOriginal) => ({
  ...await importOriginal(),
  fileExists: vi.fn(),
}));

vi.mock('../../../cli/utils/typescript.ts', async (importOriginal) => ({
  ...await importOriginal(),
  formatTsCode: vi.fn(),
}));

describe('cli/generate/generate-migration-file.ts', () => {
  const storagePath = '/cool/storage/path';
  const prevVersion = '20250614_100000';
  const currVersion = '20250615_120000';
  const tsImportExtension = '.ts';

  const opts: Parameters<typeof generateMigrationFile>[0] = {
    storagePath,
    prevVersionFile: `${storagePath}/versions/${prevVersion}-v1.ts`,
    currVersionFile: `${storagePath}/versions/${currVersion}-v2.ts`,
    prettierOptions: DEFAULT_PRETTIER_OPTS,
    tsImportExtension,
    headers: undefined,
  };

  const mockFileExists = vi.mocked(fileExists);
  const mockFormatTsCode = vi.mocked(formatTsCode);
  const mockWriteFile = vi.mocked(fs.writeFile);

  const getFormattedCode = () => mockFormatTsCode.mock.calls[0][0].code;

  beforeEach(() => {
    mockFileExists.mockResolvedValue(false);
    mockFormatTsCode.mockImplementation(({ code }) => Promise.resolve(code));
    mockWriteFile.mockResolvedValue();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateMigrationFile()', () => {
    it('creates a migration file with correct path', async () => {
      await generateMigrationFile(opts);

      expect(mockWriteFile).toHaveBeenCalledWith(
        `${storagePath}/${MIGRATIONS_DIR}/from_${prevVersion}${tsImportExtension}`,
        expect.any(String)
      );
    });

    it('generates migration with correct imports and function', async () => {
      await generateMigrationFile(opts);
      const content = mockWriteFile.mock.calls[0][1];

      expect(content).toContain(`import type { ${VERSION_TYPE_PREFIX}${prevVersion} }`);
      expect(content).toContain(`import type { ${VERSION_TYPE_PREFIX}${currVersion} }`);
      expect(content).toContain(`export const from_${prevVersion}`);
      expect(content).toContain(`store: ${VERSION_TYPE_PREFIX}${prevVersion}`);
      expect(content).toContain(`): ${VERSION_TYPE_PREFIX}${currVersion}`);
      expect(content).toContain(`${VERSION_FIELD}: '${currVersion}'`);
    });

    it('skips creation when migration file already exists', async () => {
      mockFileExists.mockResolvedValue(true);
      await generateMigrationFile(opts);

      expect(mockWriteFile).not.toHaveBeenCalled();
      expect(log.skip).toHaveBeenCalledWith(
        `Migration "from_${prevVersion}${tsImportExtension}" already exists`
      );
    });

    it('logs success message when migration is created', async () => {
      await generateMigrationFile(opts);

      expect(log.success).toHaveBeenCalledWith('Created migration');
      expect(log.info).toHaveBeenCalled();
    });

    it('includes header in migration file when provided', async () => {
      const header = '// Auto-generated migration\n';

      await generateMigrationFile({
        ...opts,
        headers: { migrationFile: header },
      });

      expect(getFormattedCode()).toContain(header);
    });

    it('uses tsImportExtension for import paths', async () => {
      await generateMigrationFile({
        ...opts,
        tsImportExtension: '.js',
      });

      const code = getFormattedCode();
      expect(code).toContain(`${prevVersion}-v1.js`);
      expect(code).toContain(`${currVersion}-v2.js`);
    });

    it('formats code using prettier options', async () => {
      await generateMigrationFile(opts);

      expect(mockFormatTsCode).toHaveBeenCalledWith(
        expect.objectContaining({
          prettierOptions: DEFAULT_PRETTIER_OPTS,
        })
      );
    });
  });
});
