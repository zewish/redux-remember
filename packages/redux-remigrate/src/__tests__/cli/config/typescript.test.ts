import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import ts from 'typescript';
import { RemigrateCliError } from '../../../cli/utils/common.ts';
import { loadTsCompilerOpts, getTsImportExtension } from '../../../cli/config/typescript.ts';

vi.mock('typescript', async (importOriginal) => ({
  default: {
    ...await importOriginal<typeof import('typescript')>(),
    findConfigFile: vi.fn(),
    readConfigFile: vi.fn(),
    parseJsonConfigFileContent: vi.fn(),
  }
}));

vi.mock('../../../cli/utils/typescript.ts', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../../cli/utils/typescript.ts')>(),
  formatTsDiagnostics: vi.fn(() => 'formatted error'),
}));

describe('cli/config/typescript.ts', () => {
  const tsconfigPath = '/path/to/tsconfig.json';
  const mockCompilerOptions: ts.CompilerOptions = {
    strict: true,
    module: ts.ModuleKind.ESNext,
  };

  beforeEach(() => {
    vi.mocked(ts.findConfigFile).mockReturnValue(tsconfigPath);
    vi.mocked(ts.readConfigFile).mockReturnValue({
      config: {
        compilerOptions: mockCompilerOptions
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadTsCompilerOpts()', () => {
    it('throws an error when no tsconfig is found', () => {
      vi.mocked(ts.findConfigFile).mockReturnValue(undefined);

      expect(() => loadTsCompilerOpts(tsconfigPath)).toThrow(
        new RemigrateCliError('No tsconfig.json found - check the "tsconfigPath" option')
      );
    });

    it('throws an error when tsconfig has read errors', () => {
      vi.mocked(ts.readConfigFile).mockReturnValue({
        error: {} as ts.Diagnostic,
      });

      expect(() => loadTsCompilerOpts(tsconfigPath)).toThrow(
        new RemigrateCliError('Failed to read tsconfig:\nformatted error')
      );
    });

    it('throws an error when tsconfig has parse errors', () => {
      vi.mocked(ts.parseJsonConfigFileContent).mockReturnValue({
        options: {},
        fileNames: [],
        errors: [{} as ts.Diagnostic],
      });

      expect(() => loadTsCompilerOpts(tsconfigPath)).toThrow(
        new RemigrateCliError('Failed to parse tsconfig:\nformatted error')
      );
    });

    it('returns compiler options on success', () => {
      vi.mocked(ts.parseJsonConfigFileContent).mockReturnValue({
        options: mockCompilerOptions,
        fileNames: [],
        errors: [],
      });

      expect(loadTsCompilerOpts(tsconfigPath)).toEqual(mockCompilerOptions);
    });
  });

  describe('getTsImportExtension()', () => {
    it('returns .ts for Node16+ resolution with allowImportingTsExtensions', () => {
      expect(getTsImportExtension({
        moduleResolution: ts.ModuleResolutionKind.Node16,
        allowImportingTsExtensions: true,
      })).toBe('.ts');
    });

    it('returns .js for Node16+ resolution without allowImportingTsExtensions', () => {
      expect(getTsImportExtension({
        moduleResolution: ts.ModuleResolutionKind.Node16,
        allowImportingTsExtensions: false,
      })).toBe('.js');
    });

    it('returns .js for NodeNext resolution without allowImportingTsExtensions', () => {
      expect(getTsImportExtension({
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        allowImportingTsExtensions: false,
      })).toBe('.js');
    });

    it('returns .js for ES2015+ module', () => {
      expect(getTsImportExtension({
        moduleResolution: ts.ModuleResolutionKind.Classic,
        module: ts.ModuleKind.ES2015,
      })).toBe('.js');
    });

    it('returns .js for ESNext module', () => {
      expect(getTsImportExtension({
        moduleResolution: ts.ModuleResolutionKind.Classic,
        module: ts.ModuleKind.ESNext,
      })).toBe('.js');
    });

    it('returns empty string for CommonJS module', () => {
      expect(getTsImportExtension({
        moduleResolution: ts.ModuleResolutionKind.Classic,
        module: ts.ModuleKind.CommonJS,
      })).toBe('');
    });
  });
});
