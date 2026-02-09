import type ts from 'typescript';
import { createTsProgram, loadTsEntryFile } from './utils/typescript.ts';
import { log } from './utils/common.ts';

export const validate = ({ storagePath, tsCompilerOptions }: {
  storagePath: string;
  tsCompilerOptions: ts.CompilerOptions;
}) => {
  const entryFilePath = `${storagePath}/index.ts`;
  const program = createTsProgram({
    entryFilePath,
    options: tsCompilerOptions
  });

  loadTsEntryFile(program, entryFilePath);
  log.success('Migrations valid');
};
