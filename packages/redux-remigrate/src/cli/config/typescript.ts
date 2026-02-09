import ts from 'typescript';
import path from 'node:path';
import { formatTsDiagnostics } from '../utils/typescript.ts';
import { RemigrateCliError } from '../utils/common.ts';
import type { TsImportExtension } from './types.ts';

export const loadTsCompilerOpts = (tsconfigPath: string | undefined): ts.CompilerOptions => {
  const cfgPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    tsconfigPath
  );

  if (!cfgPath) {
    throw new RemigrateCliError('No tsconfig.json found - check the "tsconfigPath" option');
  }

  const configFile = ts.readConfigFile(
    cfgPath,
    ts.sys.readFile.bind
  );

  if (configFile.error) {
    throw new RemigrateCliError(
      `Failed to read tsconfig:\n${formatTsDiagnostics([configFile.error])}`
    );
  }

  const cmdLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(cfgPath)
  );

  if (cmdLine.errors.length > 0) {
    throw new RemigrateCliError(
      `Failed to parse tsconfig:\n${formatTsDiagnostics(cmdLine.errors)}`
    );
  }

  return cmdLine.options;
};

export const getTsImportExtension = (options: ts.CompilerOptions): TsImportExtension => {
  if (options.moduleResolution! >= ts.ModuleResolutionKind.Node16) {
    return options.allowImportingTsExtensions
      ? '.ts'
      : '.js';
  }

  return options.module! >= ts.ModuleKind.ES2015
    ? '.js'
    : '';
};
