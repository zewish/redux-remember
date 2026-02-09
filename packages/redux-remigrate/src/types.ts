export type RemigrateConfig = {
  storagePath: string;
  stateFilePath: string;
  stateTypeExpression: string;
  prettierrcPath?: string;
  tsconfigPath?: string;
  headers?: {
    versionFile?: string;
    migrationFile?: string;
    indexFile?: string;
  },
};

export type MigratorFunction = (state: any) => any;
export type RemigrateMigrators = Record<string, MigratorFunction>;
