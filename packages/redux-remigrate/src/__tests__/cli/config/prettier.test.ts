import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveConfigFile, resolveConfig, type Options } from 'prettier';
import { DEFAULT_PRETTIER_OPTS, loadPrettierConfig } from '../../../cli/config/prettier.ts';

vi.mock('prettier');

describe('cli/config/prettier.ts', () => {
  const prettierrcPath = '/path/to/.prettierrc';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadPrettierConfig()', () => {
    it('returns default options when no config file is found', async () => {
      vi.mocked(resolveConfigFile).mockResolvedValue(null);
      expect(await loadPrettierConfig(undefined)).toEqual(DEFAULT_PRETTIER_OPTS);
    });

    it('returns default options when config file resolves to null', async () => {
      vi.mocked(resolveConfigFile).mockResolvedValue(prettierrcPath);
      vi.mocked(resolveConfig).mockResolvedValue(null);
      expect(await loadPrettierConfig(prettierrcPath)).toEqual(DEFAULT_PRETTIER_OPTS);
    });

    it('returns merged config with typescript parser', async () => {
      const userConfig: Options = {
        parser: 'babel',
        semi: false,
        tabWidth: 4
      };

      vi.mocked(resolveConfigFile).mockResolvedValue(prettierrcPath);
      vi.mocked(resolveConfig).mockResolvedValue(userConfig);

      expect(await loadPrettierConfig(prettierrcPath)).toEqual({
        ...userConfig,
        parser: 'typescript'
      });
    });
  });
});
