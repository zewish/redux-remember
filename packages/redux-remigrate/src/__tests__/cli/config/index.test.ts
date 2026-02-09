import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import process from 'node:process';
import path from 'node:path';
import { createJiti } from 'jiti';
import { fileExists } from '../../../cli/utils/files.ts';
import { log } from '../../../cli/utils/common.ts';
import { loadTsCompilerOpts, getTsImportExtension } from '../../../cli/config/typescript.ts';
import { loadPrettierConfig } from '../../../cli/config/prettier.ts';
import { findConfigFile, loadConfigOptions } from '../../../cli/config/index.ts';
import type { RemigrateConfig } from '../../../types.ts';

vi.mock('jiti');
vi.mock('../../../cli/utils/files.ts');
vi.mock('../../../cli/utils/common.ts');
vi.mock('../../../cli/config/typescript.ts');
vi.mock('../../../cli/config/prettier.ts');

describe('cli/config/index.ts', () => {
  const mockRoot = '/my/mock/root';

  describe('findConfigFile()', () => {
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns the first matching config file', async () => {
      vi.mocked(fileExists).mockResolvedValue(true);

      expect(await findConfigFile(mockRoot)).toBe(
        `${mockRoot}/remigrate.config.ts`
      );

      expect(fileExists).toHaveBeenCalledTimes(1);
    });

    it('tries all config files until one exists', async () => {
      vi.mocked(fileExists)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      expect(await findConfigFile(mockRoot)).toBe(
        `${mockRoot}/remigrate.config.cts`
      );

      expect(fileExists).toHaveBeenCalledTimes(3);
    });

    it('logs error and exits when no config file is found', async () => {
      vi.mocked(fileExists).mockResolvedValue(false);

      await findConfigFile(mockRoot);

      expect(log.error).toHaveBeenCalledWith('Config file not found');
      expect(log.error).toHaveBeenCalledTimes(3);
      expect(processExit).toHaveBeenCalledWith(2);
    });
  });

  describe('loadConfigOptions()', () => {
    const mockJitiImport = vi.fn();
    const mockConfigPath = `${mockRoot}/remigrate.config.ts`;
    const mockConfig: RemigrateConfig = {
      storagePath: 'my-remigrate-path',
      stateFilePath: 'src/state/index.ts',
      stateTypeExpression: 'PersistedState',
      headers: {
        versionFile: '// header'
      }
    };
    const mockTsCompilerOptions = { strict: true };
    const mockTsImportExtension = '.ts';
    const mockPrettierOptions = { semi: true };

    beforeEach(() => {
      mockJitiImport.mockResolvedValue({ default: mockConfig });
      vi.mocked(createJiti).mockReturnValue({ import: mockJitiImport } as any);
      vi.mocked(loadTsCompilerOpts).mockReturnValue(mockTsCompilerOptions);
      vi.mocked(getTsImportExtension).mockReturnValue(mockTsImportExtension);
      vi.mocked(loadPrettierConfig).mockResolvedValue(mockPrettierOptions);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('loads and resolves config options', async () => {
      const result = await loadConfigOptions(mockConfigPath);

      expect(mockJitiImport).toHaveBeenCalledWith(mockConfigPath);
      expect(result.storagePath).toBe(`${mockRoot}/${mockConfig.storagePath}`);
      expect(result.stateFilePath).toBe(path.resolve(mockRoot, mockConfig.stateFilePath));
      expect(result.stateTypeExpression).toBe(mockConfig.stateTypeExpression);
      expect(result.headers).toEqual(mockConfig.headers);

      expect(loadTsCompilerOpts).toHaveBeenCalled();
      expect(result.tsCompilerOptions).toEqual(mockTsCompilerOptions);

      expect(getTsImportExtension).toHaveBeenCalledWith(mockTsCompilerOptions);
      expect(result.tsImportExtension).toBe(mockTsImportExtension);

      expect(loadPrettierConfig).toHaveBeenCalled();
      expect(result.prettierOptions).toEqual(mockPrettierOptions);
    });
  });
});
