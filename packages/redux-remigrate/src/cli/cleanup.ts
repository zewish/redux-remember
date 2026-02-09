import fs from 'node:fs/promises';
import path from 'node:path';
import colors from 'picocolors';
import ts from 'typescript';
import type { RemigrateOptions, TsImportExtension } from './config/index.ts';
import { fileExists, listTsFiles, replaceFileExtension } from './utils/files.ts';
import { generateIndexFile } from './generate/generate-index-file.ts';
import { log } from './utils/common.ts';

type CleanupOptions = Pick<
  RemigrateOptions,
  'storagePath' | 'tsImportExtension' | 'prettierOptions' | 'tsCompilerOptions'
>;

const extractTsImports = async (
  sourceTsFile: string,
  tsImportExtension: TsImportExtension
): Promise<string[]> => {
  const content = await fs.readFile(sourceTsFile, 'utf-8');
  const sourceFile = ts.createSourceFile(sourceTsFile, content, ts.ScriptTarget.Latest, true);
  const extractedImports: string[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      extractedImports.push(path.resolve(
        path.dirname(sourceTsFile),
        replaceFileExtension(
          node.moduleSpecifier.text,
          tsImportExtension,
          '.ts'
        )
      ));
    }
  });

  const existingFiles = await Promise.all(extractedImports.map(fileExists));
  return extractedImports.filter((_, i) => existingFiles[i]);
};

const cleanupOldFiles = async ({
  storagePath,
  tsImportExtension
}: CleanupOptions): Promise<void> => {
  const migrationsDir = `${storagePath}/migrations`;
  const versionsDir = `${storagePath}/versions`;

  const allVersionFiles = new Set(await listTsFiles(versionsDir));
  const allMigrationFiles = await listTsFiles(migrationsDir);
  const usedFiles = new Set<string>();

  for (const migrationFile of allMigrationFiles) {
    for (const versionFile of await extractTsImports(migrationFile, tsImportExtension)) {
      usedFiles.add(versionFile);
    }
  }

  const unusedFiles = allVersionFiles.difference(usedFiles);

  if (!allMigrationFiles.length) {
    log.skip('Cleanup requires at least one migration');
    return;
  }

  if (unusedFiles.size === 0) {
    log.skip('No unused version files');
    return;
  }

  log.success(`Removed ${unusedFiles.size} unused version file${unusedFiles.size > 1 ? 's' : ''}`);
  for (const filePath of unusedFiles) {
    await fs.unlink(filePath);
    log.info(`  ${colors.dim('➜')} ${path.basename(filePath)}`);
  }
};

export const cleanup = async (options: CleanupOptions) => {
  await cleanupOldFiles(options);
  await generateIndexFile(options);
};
