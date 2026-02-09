import { describe, it, expect, vi } from 'vitest';
import {
  formatTsCode,
  createTsProgram,
  loadTsEntryFile,
  getTsStatementCode,
  runTsTypeExtractor,
  formatTsDiagnostics,
} from '../../../cli/utils/typescript.ts';
import { RemigrateCliError } from '../../../cli/utils/common.ts';
import ts from 'typescript';
import { DEFAULT_PRETTIER_OPTS } from '../../../cli/config/prettier.ts';

describe('cli/utils/typescript.ts', () => {
  const entryFilePath = '/a/fake/entry/file/path.ts';

  describe('formatTsDiagnostics()', () => {
    it('returns empty string for empty diagnostics', () => {
      const result = formatTsDiagnostics([]);
      expect(result).toBe('');
    });

    it('returns formatted diagnostic messages', () => {
      const sourceCode = 'const x: number = "wrong";';
      const fileName = '/path/to/test.ts';
      const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest);

      const diagnostic: ts.Diagnostic = {
        category: ts.DiagnosticCategory.Error,
        code: 2322,
        file: sourceFile,
        start: 18,
        length: 7,
        messageText: 'Type string is not assignable to type number',
      };

      const result = formatTsDiagnostics([diagnostic]);
      expect(result).toContain(fileName);
      expect(result).toContain(diagnostic.messageText);
      expect(result).toContain(diagnostic.code);
    });
  });

  describe('formatTsCode()', () => {
    it('formats code using prettier', async () => {
      expect(await formatTsCode({
        code: 'type X={foo:string,bar:"bla"}',
        prettierOptions: DEFAULT_PRETTIER_OPTS,
      })).toBe(`type X = { foo: string; bar: 'bla' };\n`);
    });
  });

  describe('createTsProgram()', () => {
    it('creates a TypeScript program with custom readFile', () => {
      const readFileSpy = vi.fn().mockReturnValue('export type Test = string;');
      const program = createTsProgram({
        entryFilePath,
        options: {},
        readFile: readFileSpy,
      });

      expect(program).toBeDefined();
      expect(readFileSpy).toHaveBeenCalled();
    });

    it('creates a TypeScript program with default readFile', () => {
      expect(createTsProgram({
        entryFilePath,
        options: { strict: true },
      }).getCompilerOptions().strict).toBe(true);
    });
  });

  describe('loadTsEntryFile()', () => {
    it('loads and returns source file when valid', () => {
      const program = createTsProgram({
        entryFilePath,
        options: {},
        readFile: () => 'export type Test = string;',
      });

      expect(
        loadTsEntryFile(program, entryFilePath).fileName
      ).toBe(entryFilePath);
    });

    it('throws an error when source file does not exist', () => {
      const nonExistentPath = '/bla/bla/non/existent/file.ts';
      const program = createTsProgram({
        entryFilePath,
        options: {},
        readFile: () => 'export type Test = string;',
      });

      expect(() => loadTsEntryFile(program, nonExistentPath)).toThrow(
        new RemigrateCliError(`Source file not found: ${nonExistentPath}`)
      );
    });

    it('throws an error when there are type errors', () => {
      const program = createTsProgram({
        entryFilePath,
        options: {},
        readFile: () => 'const x: number = "not a number";',
      });

      expect(() => loadTsEntryFile(program, entryFilePath)).toThrow(RemigrateCliError);
      expect(() => loadTsEntryFile(program, entryFilePath)).toThrow(
        'Type resolution failed:'
      );
    });
  });

  describe('getTsStatementCode()', () => {
    const createProgram = (readFile: () => string) => createTsProgram({
        entryFilePath,
        options: {},
        readFile
      })

    it('extracts type alias code from program', () => {
      const result = getTsStatementCode({
        program: createProgram(() => 'export type MyType = { foo: string; bar: number };'),
        entryFilePath,
        statementName: 'MyType',
      });

      expect(result).toContain('foo: string');
      expect(result).toContain('bar: number');
    });

    it('throws RemigrateCliError when type alias not found', () => {
      expect(() => getTsStatementCode({
        program: createProgram(() => 'export type MyType = string;'),
        entryFilePath,
        statementName: 'NonExistent',
      })).toThrow(new RemigrateCliError('TypeScript node "NonExistent" not found'));
    });
  });

  describe('runTsTypeExtractor()', () => {
    const tsCompilerOptions: ts.CompilerOptions = {
      skipLibCheck: true
    };

    it('extracts and formats type when prettierOptions provided', async () => {
      const result = await runTsTypeExtractor({
        entryFilePath,
        getEntryFileContents: () => 'export type Result = { id: number; name: string };',
        extractResultType: 'Result',
        tsCompilerOptions: tsCompilerOptions,
        prettierOptions: DEFAULT_PRETTIER_OPTS,
      });

      expect(result).toContain('id: number');
      expect(result).toContain('name: string');
    });

    it('extracts type without formatting when prettierOptions undefined', async () => {
      expect(await runTsTypeExtractor({
        entryFilePath,
        getEntryFileContents: () => 'export type Result = { active: boolean };',
        extractResultType: 'Result',
        tsCompilerOptions: tsCompilerOptions,
        prettierOptions: undefined,
      })).toContain('active: boolean');
    });

    it('uses original file contents when not entry file', async () => {
      expect(await runTsTypeExtractor({
        entryFilePath,
        getEntryFileContents: (contents) => {
          expect(contents).toBe('');
          return 'export type Result = string;';
        },
        extractResultType: 'Result',
        tsCompilerOptions: tsCompilerOptions,
        prettierOptions: undefined,
      })).toBe('string');
    });
  });
});
