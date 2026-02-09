import type ts from 'typescript';
import type { RemigrateOptions } from '../config/index.ts';
import { runTsTypeExtractor } from './typescript.ts';
import { getVersionFromFileName, VERSION_FIELD, VERSION_TYPE_PREFIX } from './version.ts';

type ExtractOptions = { version: string } & Pick<
  RemigrateOptions,
  'tsCompilerOptions' | 'stateFilePath' | 'stateTypeExpression' | 'prettierOptions'
>;

type ExtractFileOptions = { versionFilePath: string } & Pick<
  RemigrateOptions,
  'tsCompilerOptions' | 'prettierOptions'
>;

export const EXTRACT_TYPE_UTILS = `
  type __REDUX_REMIGRATE__Extract<T> = T extends (...args: infer A) => infer R
    ? (...args: __REDUX_REMIGRATE__Extract<A>) => __REDUX_REMIGRATE__Extract<R>
    : T extends Promise<infer U>
      ? Promise<__REDUX_REMIGRATE__ExtractTypeArgument<U>>
      : {
        [K in keyof T]: T[K] extends string
          ? __REDUX_REMIGRATE__ExtractUnion<T[K]>
          : __REDUX_REMIGRATE__Extract<T[K]>;
      } & {};

  type __REDUX_REMIGRATE__ExtractTypeArgument<T> = [T & {}] extends [never]
    ? T
    : __REDUX_REMIGRATE__Extract<T & {}>;

  type __REDUX_REMIGRATE__ExtractUnion<T extends string> = \`\${T}_\` extends \`\${infer U}_\`
    ? U
    : never;
`;

export const getTypeExtractorCode = (typeExpression: string): {
  extractResultType: string;
  getEntryFileContents: (contents: string) => string;
} => ({
  extractResultType: '__REDUX_REMIGRATE__ExtractResult',
  getEntryFileContents: (contents) => `
    ${contents}
    ${EXTRACT_TYPE_UTILS}
    type __REDUX_REMIGRATE__ExtractResult = __REDUX_REMIGRATE__Extract<${typeExpression}>;
  `
});

export const extractType = ({
  version,
  stateTypeExpression,
  stateFilePath,
  ...opts
}: ExtractOptions): Promise<string> => runTsTypeExtractor({
  ...opts,
  entryFilePath: stateFilePath,
  ...getTypeExtractorCode(
    `${stateTypeExpression} & { ${VERSION_FIELD}: '${version}' }`
  ),
});

export const extractTypeFromVersionFile = async ({
  versionFilePath,
  ...opts
}: ExtractFileOptions): Promise<string> => runTsTypeExtractor({
  ...opts,
  entryFilePath: versionFilePath,
  ...getTypeExtractorCode(
    `${VERSION_TYPE_PREFIX}${getVersionFromFileName(versionFilePath)}`
  ),
});

export const extractTypeVersion = async ({ filePath, typeExpression, tsCompilerOptions }: {
  filePath: string,
  typeExpression: string,
  tsCompilerOptions: ts.CompilerOptions
}): Promise<string | false> => {
  const result = await runTsTypeExtractor({
    tsCompilerOptions,
    prettierOptions: undefined,
    entryFilePath: filePath,
    extractResultType: '__REDUX_REMIGRATE__Version',
    getEntryFileContents: (contents) => `
      ${contents}
      ${EXTRACT_TYPE_UTILS}
      type __REDUX_REMIGRATE__Version = __REDUX_REMIGRATE__Extract<${typeExpression}> extends {
        ${VERSION_FIELD}: infer V
      }
        ? V
        : never;
    `
  });

  if (result === 'never') {
    return false;
  }

  return result;
};

export const areTypesDifferent = async (
  type1: string,
  type2: string,
  tsCompilerOptions: ts.CompilerOptions
): Promise<boolean> => {
  const extractResultType = `__REDUX_REMIGRATE__CompareResult`;
  const code = await runTsTypeExtractor({
    entryFilePath: '__REMIGRATE_COMPARE__.ts',
    extractResultType,
    getEntryFileContents: () => `
      type DiffTypes<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2)
        ? false
        : true;

      type Type1 = ${type1};
      type Type2 = ${type2};

      type ${extractResultType} = DiffTypes<
        Omit<Type1, '${VERSION_FIELD}'>,
        Omit<Type2, '${VERSION_FIELD}'>
      >;
    `,
    tsCompilerOptions,
    prettierOptions: undefined,
  });

  return code === 'true';
};
