import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type ts from 'typescript';
import {
  EXTRACT_TYPE_UTILS,
  getTypeExtractorCode,
  extractType,
  extractTypeFromVersionFile,
  extractTypeVersion,
  areTypesDifferent,
} from '../../../cli/utils/type-helper.ts';
import { VERSION_FIELD, VERSION_TYPE_PREFIX } from '../../../cli/utils/version.ts';
import { runTsTypeExtractor } from '../../../cli/utils/typescript.ts';
import { DEFAULT_PRETTIER_OPTS } from '../../../cli/config/prettier.ts';

vi.mock('../../../cli/utils/typescript.ts', async (importOriginal) => ({
  runTsTypeExtractor: vi.fn(
    (await importOriginal<typeof import('../../../cli/utils/typescript.ts')>()).runTsTypeExtractor
  ),
}));

describe('cli/utils/type-helper.ts', () => {
  const tsCompilerOptions: ts.CompilerOptions = { skipLibCheck: true };
  const prettierOptions = DEFAULT_PRETTIER_OPTS;
  const runTsTypeExtractorMock = vi.mocked(runTsTypeExtractor);
  const getTsTypeExtractorCall = () => runTsTypeExtractorMock.mock.calls[0][0];

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getTypeExtractorCode()', () => {
    it('returns extractResultType and getEntryFileContents', () => {
      const typeExpression = 'MyType';
      const contents = `type ${typeExpression} = { bla: number }`;
      const { extractResultType, getEntryFileContents } = getTypeExtractorCode(typeExpression);

      const result = getEntryFileContents(contents);
      expect(extractResultType).toBe('__REDUX_REMIGRATE__ExtractResult');
      expect(result).toContain(contents);
      expect(result).toContain(EXTRACT_TYPE_UTILS);
      expect(result).toContain(
        `type __REDUX_REMIGRATE__ExtractResult = __REDUX_REMIGRATE__Extract<${typeExpression}>;`
      );
    });
  });

  describe('extractType()', () => {
    it('calls runTsTypeExtractor with correct parameters', async () => {
      runTsTypeExtractorMock.mockImplementation(vi.fn());

      const version = '20250101_120000';
      const stateTypeExpression = 'MyState';
      const stateFilePath = '/fake/state/file.ts';

      await extractType({
        version,
        stateTypeExpression,
        stateFilePath,
        tsCompilerOptions,
        prettierOptions,
      });

      expect(runTsTypeExtractorMock).toHaveBeenCalledWith({
        entryFilePath: stateFilePath,
        tsCompilerOptions,
        prettierOptions,
        extractResultType: '__REDUX_REMIGRATE__ExtractResult',
        getEntryFileContents: expect.any(Function),
      });

      expect(
        getTsTypeExtractorCall().getEntryFileContents('type MyState = { name: string };')
      ).toContain(`${stateTypeExpression} & { ${VERSION_FIELD}: '${version}' }`);
    });
  });

  describe('extractTypeFromVersionFile()', () => {
    it('calls runTsTypeExtractor with version from file path', async () => {
      runTsTypeExtractorMock.mockImplementation(vi.fn());

      const version = '20250615_093045';
      const versionFilePath = `/migrations/${version}-init.ts`;

      await extractTypeFromVersionFile({
        versionFilePath,
        tsCompilerOptions,
        prettierOptions,
      });

      expect(runTsTypeExtractorMock).toHaveBeenCalledWith({
        entryFilePath: versionFilePath,
        tsCompilerOptions,
        prettierOptions,
        extractResultType: '__REDUX_REMIGRATE__ExtractResult',
        getEntryFileContents: expect.any(Function),
      });

      expect(
        getTsTypeExtractorCall().getEntryFileContents('')
      ).toContain(`${VERSION_TYPE_PREFIX}${version}`);
    });
  });

  describe('extractTypeVersion()', () => {
    const versionResult = "'20250101_120000'";
    const run = () => extractTypeVersion({
      filePath: '/fake/state.ts',
      typeExpression: 'MyState',
      tsCompilerOptions,
    });

    beforeEach(() => {
      runTsTypeExtractorMock.mockResolvedValue(versionResult);
    });

    it('returns version string when type has version field', async () => {
      runTsTypeExtractorMock.mockResolvedValue(versionResult);
      expect(await run()).toBe(versionResult);

      const call = getTsTypeExtractorCall();
      expect(call.extractResultType).toBe('__REDUX_REMIGRATE__Version');
      expect(call.getEntryFileContents('')).toContain(VERSION_FIELD);
    });

    it('returns false when result is never', async () => {
      runTsTypeExtractorMock.mockResolvedValue('never');
      expect(await run()).toBe(false);
    });
  });

  describe('areTypesDifferent()', () => {
    it('returns true when types are different', async () => {
      expect(await areTypesDifferent(
        '{ foo: string, _remigrateVersion: "1" }',
        '{ foo: number, _remigrateVersion: "2" }',
        tsCompilerOptions
      )).toBe(true);
    });

    it('returns false when types are the same', async () => {
      expect(await areTypesDifferent(
        '{ foo: string, _remigrateVersion: "3" }',
        '{ foo: string, _remigrateVersion: "4" }',
        tsCompilerOptions
      )).toBe(false);
    });
  });
});
