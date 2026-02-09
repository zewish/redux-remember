import type { Options as PrettierOptions } from 'prettier';
import ts from 'typescript';
import type { RemigrateConfig } from '../../types.ts';

export type TsImportExtension = '.js' | '.ts' | '';

export type RemigrateOptions = Omit<RemigrateConfig, 'tsconfigPath' | 'prettierrcPath'> & {
  tsCompilerOptions: ts.CompilerOptions;
  prettierOptions: PrettierOptions;
  tsImportExtension: TsImportExtension;
};
