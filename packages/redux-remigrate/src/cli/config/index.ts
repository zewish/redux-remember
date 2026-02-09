import path from 'node:path';
import process from 'node:process';
import colors from 'picocolors';
import { createJiti } from 'jiti';
import type { RemigrateConfig } from '../../types.ts';
import { getTsImportExtension, loadTsCompilerOpts } from './typescript.ts';
import { loadPrettierConfig } from './prettier.ts';
import type { RemigrateOptions } from './types.ts';
import { log } from '../utils/common.ts';
import { fileExists } from '../utils/files.ts';

const REMIGRATE_CONFIG_FILES = [
  'remigrate.config.ts',
  'remigrate.config.mts',
  'remigrate.config.cts',
];

export * from './types.ts';

export const findConfigFile = async (root: string): Promise<string> => {
  for (const fileName of REMIGRATE_CONFIG_FILES) {
    const filePath = path.join(root, fileName);

    if (await fileExists(filePath)) {
      return filePath;
    }
  }

  log.error('Config file not found');
  log.error(colors.dim(`  Searched in: ${root}`));
  log.error(colors.dim(`  Expected one of: ${REMIGRATE_CONFIG_FILES.join(', ')}`));
  process.exit(2);
};

export const loadConfigOptions = async (configPath: string): Promise<RemigrateOptions> => {
  const root = path.dirname(configPath);
  const {
    default: {
      storagePath,
      headers,
      prettierrcPath,
      stateFilePath,
      stateTypeExpression,
      tsconfigPath
    }
  } = await createJiti(root).import<{ default: RemigrateConfig }>(configPath);

  const resolve = <T extends string | undefined>(filePath: T): T => filePath
    ? path.resolve(root, filePath) as T
    : undefined as T;

  const tsCompilerOptions = loadTsCompilerOpts(resolve(tsconfigPath));

  return {
    storagePath: resolve(storagePath),
    stateFilePath: resolve(stateFilePath),
    stateTypeExpression,
    headers,
    tsCompilerOptions,
    tsImportExtension: getTsImportExtension(tsCompilerOptions),
    prettierOptions: await loadPrettierConfig(
      resolve(prettierrcPath)
    ),
  };
};
