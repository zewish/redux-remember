import { resolveConfigFile, resolveConfig, type Options } from 'prettier';

export const DEFAULT_PRETTIER_OPTS: Options = {
  parser: 'typescript',
  singleQuote: true,
  semi: true,
};

export const loadPrettierConfig = async (prettierrcPath: string | undefined): Promise<Options> => {
  const resolvedPath = await resolveConfigFile(prettierrcPath);
  if (!resolvedPath) {
    return DEFAULT_PRETTIER_OPTS;
  }

  const config = await resolveConfig(resolvedPath);
  if (!config) {
    return DEFAULT_PRETTIER_OPTS;
  }

  return {
    ...config,
    parser: 'typescript',
  };
};
