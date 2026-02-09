import type { Reducer } from 'redux';
import type { MigratorFunction, RemigrateConfig, RemigrateMigrators } from './types.ts';

export * from './types.ts';

export const defineRemigrateConfig = (config: RemigrateConfig): RemigrateConfig => config;

export const _remigrateVersion: Reducer<string> = (version = '') => version;

export class RemigrateError extends Error {
  override name = 'RemigrateError';
}

export const createRemigrate = ({ firstVersion, latestVersion, migrators }: {
  migrators: RemigrateMigrators;
  firstVersion: string;
  latestVersion: string;
}): MigratorFunction => (state) => {
  let version = state._remigrateVersion || firstVersion;
  const versionsMigrated = new Set<string>();

  while (version !== latestVersion) {
    if (versionsMigrated.has(version)) {
      throw new RemigrateError(`Circular migration detected in migrator "from_${version}"`);
    }
    versionsMigrated.add(version);

    const migrator = migrators[`from_${version}`];

    if (!migrator) {
      throw new RemigrateError(`Migrator not found for store version: "${version}"`);
    }

    state = migrator(state);

    if (state._remigrateVersion === version) {
      throw new RemigrateError(`Migrator "from_${version}" did not update _remigrateVersion`);
    }

    version = state._remigrateVersion;
  }

  return state;
};
