import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseArgs } from 'node:util';
import process from 'node:process';
import { findConfigFile, loadConfigOptions } from '../../cli/config/index.ts';
import { RemigrateCliError, log } from '../../cli/utils/common.ts';
import type { RemigrateOptions } from '../../cli/config/index.ts';

vi.mock('node:util', async (importOriginal) => ({
  ...await importOriginal(),
  parseArgs: vi.fn().mockReturnValue({ values: { help: true }, positionals: [] }),
}));

vi.mock('../../cli/config/index.ts');
vi.mock('../../cli/utils/common.ts', async (importOriginal) => ({
  ...await importOriginal(),
  log: {
    info: vi.fn(),
    error: vi.fn(),
  }
}));
vi.mock('../../cli/init.ts', () => ({ init: vi.fn() }));
vi.mock('../../cli/cleanup.ts', () => ({ cleanup: vi.fn() }));
vi.mock('../../cli/create.ts', () => ({ create: vi.fn() }));
vi.mock('../../cli/validate.ts', () => ({ validate: vi.fn() }));

describe('cli/index.ts', async () => {
  const mockOptions: RemigrateOptions = {
    storagePath: '/storage',
    stateFilePath: '/state.ts',
    stateTypeExpression: 'AppState',
    tsCompilerOptions: {},
    prettierOptions: {},
    tsImportExtension: '.ts',
    headers: undefined,
  };

  const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(
    (() => {}) as typeof process.exit
  );

  const { runCli, usage, commands } = await import('../../cli/index.ts');

  beforeEach(() => {
    vi.mocked(findConfigFile).mockResolvedValue('/config.ts');
    vi.mocked(loadConfigOptions).mockResolvedValue(mockOptions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('commands', () => {
    it('exports all command functions', () => {
      expect(commands).toEqual({
        init: expect.any(Function),
        create: expect.any(Function),
        cleanup: expect.any(Function),
        validate: expect.any(Function),
      });
    });
  });

  describe('runCli()', () => {
    const mockParseArgs = vi.mocked(parseArgs);

    it('shows usage and exits when --help flag is provided', async () => {
      mockParseArgs.mockReturnValue({
        values: { help: true },
        positionals: [],
      });

      await runCli();

      expect(log.info).toHaveBeenCalledWith(usage);
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('shows usage and exits when no command is provided', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: [],
      });

      await runCli();

      expect(log.info).toHaveBeenCalledWith(usage);
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('runs init command with suffix', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['init', 'custom'],
      });

      await runCli();

      expect(commands.init).toHaveBeenCalledWith({
        ...mockOptions,
        typeFileSuffix: '-custom',
      });
    });

    it('runs create command without suffix', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['create'],
      });

      await runCli();

      expect(commands.create).toHaveBeenCalledWith({
        ...mockOptions,
        typeFileSuffix: '',
      });
    });

    it('runs cleanup command', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['cleanup'],
      });

      await runCli();

      expect(commands.cleanup).toHaveBeenCalledWith(mockOptions);
    });

    it('runs validate command', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['validate'],
      });

      await runCli();

      expect(commands.validate).toHaveBeenCalledWith(mockOptions);
    });

    it('errors when cleanup receives arguments', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['cleanup', 'extra'],
      });

      await runCli();

      expect(log.error).toHaveBeenCalledWith(
        expect.stringContaining('does not accept arguments')
      );
      expect(processExitSpy).toHaveBeenCalledWith(5);
    });

    it('errors when validate receives arguments', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['validate', 'extra'],
      });

      await runCli();

      expect(log.error).toHaveBeenCalledWith(
        expect.stringContaining('does not accept arguments')
      );
      expect(processExitSpy).toHaveBeenCalledWith(5);
    });

    it('errors on unknown command', async () => {
      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['non-existent'],
      });

      await runCli();

      expect(log.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown command')
      );
      expect(processExitSpy).toHaveBeenCalledWith(4);
    });

    it('uses custom config path when provided', async () => {
      const config = 'custom-config.ts';
      mockParseArgs.mockReturnValue({
        values: { config },
        positionals: ['init'],
      });

      await runCli();

      expect(loadConfigOptions).toHaveBeenCalledWith(`${process.cwd()}/${config}`);
      expect(findConfigFile).not.toHaveBeenCalled();
    });

    it('handles RemigrateCliError gracefully', async () => {
      const errorMessage = 'Test remigrate error';
      vi.mocked(commands.init).mockRejectedValue(new RemigrateCliError(errorMessage));

      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['init'],
      });
      await runCli();

      expect(log.error).toHaveBeenCalledWith(errorMessage);
      expect(processExitSpy).toHaveBeenCalledWith(3);
    });

    it('handles unexpected errors', async () => {
      const error = new Error('Beep boop');
      vi.mocked(commands.init).mockRejectedValue(error);

      mockParseArgs.mockReturnValue({
        values: {},
        positionals: ['init'],
      });
      await runCli();

      expect(log.error).toHaveBeenCalledWith(`An unexpected error occurred\n${error}`);
      expect(processExitSpy).toHaveBeenCalledWith(3);
    });
  });
});
