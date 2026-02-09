import process from 'node:process';
import ts from 'typescript';
import { format, type Options as PrettierOptions } from 'prettier';
import { RemigrateCliError } from './common.ts';

export const formatTsDiagnostics = (diagnostics: readonly ts.Diagnostic[]): string => (
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n',
  })
);

export const formatTsCode = ({ code, prettierOptions }: {
  code: string;
  prettierOptions: PrettierOptions;
}): Promise<string> => format(
  code,
  prettierOptions
);

export const createTsProgram = ({
  entryFilePath,
  options,
  readFile = (filePath, originalReadFile) => originalReadFile(filePath),
}: {
  entryFilePath: string,
  options: ts.CompilerOptions,
  readFile?: (
    filePath: string,
    originalReadFile: (fileName: string) => string | undefined
  ) => string | undefined,
}): ts.Program => {
  const compilerHost = ts.createCompilerHost(options, true);
  const originalReadFile = compilerHost.readFile;

  compilerHost.readFile = (filePath) => readFile(
    filePath,
    originalReadFile
  );

  return ts.createProgram(
    [entryFilePath],
    options,
    compilerHost,
  );
};

export const loadTsEntryFile = (
  program: ts.Program,
  entryFilePath: string
): ts.SourceFile => {
  const sourceFile = program.getSourceFile(entryFilePath);

  if (!sourceFile) {
    throw new RemigrateCliError(`Source file not found: ${entryFilePath}`);
  }

  const diagnostics = formatTsDiagnostics(
    [ ...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics() ]
    .filter(({ category }) => category === ts.DiagnosticCategory.Error)
  );

  if (diagnostics.length > 0) {
    throw new RemigrateCliError(`Type resolution failed:\n${diagnostics}`);
  }

  return sourceFile;
};

export const getTsStatementCode = ({ program, entryFilePath, statementName }: {
  program: ts.Program,
  entryFilePath: string,
  statementName: string
}): string => {
  const entry = loadTsEntryFile(program, entryFilePath);
  const resultNode = entry.statements.find((statement) => (
    ts.isTypeAliasDeclaration(statement) && statement.name.text === statementName
  ));

  if (!resultNode) {
    throw new RemigrateCliError(`TypeScript node "${statementName}" not found`);
  }

  const typeChecker = program.getTypeChecker();
  return typeChecker.typeToString(
    typeChecker.getTypeAtLocation(resultNode),
    undefined,
    ts.TypeFormatFlags.NodeBuilderFlagsMask,
  );
};

export const runTsTypeExtractor = async ({
  entryFilePath,
  getEntryFileContents,
  extractResultType,
  tsCompilerOptions,
  prettierOptions,
}: {
  entryFilePath: string;
  getEntryFileContents: (contents: string) => string;
  extractResultType: string;
  tsCompilerOptions: ts.CompilerOptions;
  prettierOptions: PrettierOptions | undefined;
}): Promise<string> => {
  const program = createTsProgram({
    entryFilePath,
    options: tsCompilerOptions,
    readFile(filePath, originalReadFile) {
      const contents = originalReadFile(filePath);

      if (filePath === entryFilePath) {
        return getEntryFileContents(contents ?? '');
      }

      return contents;
    }
  });

  const code = getTsStatementCode({
    program,
    entryFilePath,
    statementName: extractResultType
  });

  return prettierOptions
    ? formatTsCode({ prettierOptions, code })
    : code;
};
