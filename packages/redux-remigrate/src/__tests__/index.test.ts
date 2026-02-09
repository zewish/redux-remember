import { describe, it, expect, beforeEach } from 'vitest';
import {
  defineRemigrateConfig,
  _remigrateVersion,
  createRemigrate,
  RemigrateError
} from '../index.ts';
import type { RemigrateConfig } from '../types.ts';

describe('index.ts', () => {
  describe('RemigrateError', () => {
    it('behaves like an extension class of Error', () => {
      const message = 'beep boop';
      const error = new RemigrateError(message);
      expect(error).toBeInstanceOf(RemigrateError);
      expect(error.name).toBe('RemigrateError');
      expect(error.message).toBe(message);
    });
  });

  describe('defineRemigrateConfig()', () => {
    it('returns the passed config object', () => {
      const config: RemigrateConfig = {
        storagePath: './storage',
        stateFilePath: './state.ts',
        stateTypeExpression: 'PersistedState',
        prettierrcPath: './.prettierrc',
        tsconfigPath: './tsconfig.json',
        headers: {
          versionFile: '// version header',
          migrationFile: '// migration header',
          indexFile: '// index header',
        },
      };

      expect(defineRemigrateConfig(config)).toEqual(config);
    });
  });

  describe('_remigrateVersion()', () => {
    it('returns the version when provided', () => {
      expect(_remigrateVersion('v1', { type: 'ANY_ACTION' })).toBe('v1');
    });

    it('returns empty string when version is undefined', () => {
      expect(_remigrateVersion(undefined, { type: 'ANY_ACTION' })).toBe('');
    });
  });

  describe('createRemigrate()', () => {
    let persistedState: Record<string, any>;

    const from_v1 = (state: Record<string, any>) => ({
      ...state,
      fromV1: true,
      _remigrateVersion: 'v2'
    });

    const from_v2 = (state: Record<string, any>) => ({
      ...state,
      fromV2: true,
      _remigrateVersion: 'v3'
    });

    beforeEach(() => {
      persistedState = { _remigrateVersion: 'v1', data: 'test' };
    });

    it('does not change state when already at latest version', () => {
      persistedState._remigrateVersion = 'v2';

      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v2',
        migrators: { from_v1 },
      });

      expect(migrate(persistedState)).toEqual(persistedState);
    });

    it('migrates from first version to latest version', () => {
      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v2',
        migrators: { from_v1 },
      });

      expect(migrate(persistedState)).toEqual({
        ...persistedState,
        fromV1: true,
        _remigrateVersion: 'v2',
      });
    });

    it('does not fail when _remigrateVersion is not set', () => {
      persistedState._remigrateVersion = '';

      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v2',
        migrators: { from_v1 },
      });

      expect(migrate(persistedState)._remigrateVersion).toBe('v2');
    });

    it('runs multiple migrations in sequence', () => {
      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v3',
        migrators: { from_v1, from_v2 },
      });

      expect(migrate(persistedState)).toEqual({
        ...persistedState,
        _remigrateVersion: 'v3',
        fromV1: true,
        fromV2: true,
      });
    });

    it('starts migration from current version, not first version', () => {
      persistedState._remigrateVersion = 'v2';

      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v3',
        migrators: { from_v1, from_v2 },
      });

      const result = migrate(persistedState);
      expect(result.fromV1).toBeUndefined();
      expect(result.fromV2).toBe(true);
      expect(result._remigrateVersion).toBe('v3');
    });

    it('throws error when next migrator is missing', () => {
      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v3',
        migrators: { from_v1 }, // missing from_v2
      });

      expect(() => migrate(persistedState)).toThrow(
        new RemigrateError('Migrator not found for store version: "v2"')
      );
    });

    it('throws error when migrator does not update _remigrateVersion', () => {
      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v2',
        migrators: {
          from_v1: (state) => ({
            ...state,
            _remigrateVersion: 'v1'
          }),
        },
      });

      expect(() => migrate(persistedState)).toThrow(
        new RemigrateError('Migrator "from_v1" did not update _remigrateVersion')
      );
    });

    it('throws error on circular migration', () => {
      const migrate = createRemigrate({
        firstVersion: 'v1',
        latestVersion: 'v3',
        migrators: {
          from_v1,
          from_v2: (state) => ({
            ...state,
            _remigrateVersion: 'v1'
          }),
        },
      });

      expect(() => migrate(persistedState)).toThrow(
        new RemigrateError('Circular migration detected in migrator "from_v1"')
      );
    });
  });
});
