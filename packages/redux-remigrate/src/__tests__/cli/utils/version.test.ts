import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  VERSION_TYPE_PREFIX,
  VERSION_FIELD,
  newMigrationVersion,
  getVersionFromFileName,
} from '../../../cli/utils/version.ts';
import { RemigrateCliError } from '../../../cli/utils/common.ts';

describe('cli/utils/version.ts', () => {
  describe('constants', () => {
    it('exports VERSION_TYPE_PREFIX', () => {
      expect(VERSION_TYPE_PREFIX).toBe('RemigrateStore_');
    });

    it('exports VERSION_FIELD', () => {
      expect(VERSION_FIELD).toBe('_remigrateVersion');
    });
  });

  describe('newMigrationVersion()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns version in YYYYMMDD_HHMMSS format', () => {
      vi.setSystemTime(new Date(2025, 5, 15, 9, 30, 45));
      expect(newMigrationVersion()).toBe('20250615_093045');
    });

    it('pads single digit values with zeros', () => {
      vi.setSystemTime(new Date(2025, 0, 5, 1, 2, 3));
      expect(newMigrationVersion()).toBe('20250105_010203');
    });
  });

  describe('getVersionFromFileName()', () => {
    it('extracts version from file name', () => {
      const dateTime = '20250615_093045';
      expect(getVersionFromFileName(`${dateTime}_add_user.ts`)).toBe(dateTime);
    });

    it('extracts version from full path', () => {
      const dateTime = '20250615_093045';
      expect(
        getVersionFromFileName(`/path/to/migrations/${dateTime}_add_user.ts`)
      ).toBe(dateTime);
    });

    it('throws RemigrateCliError for invalid file name', () => {
      expect(() => getVersionFromFileName('invalid_file.ts')).toThrow(
        new RemigrateCliError('Could not extract version from file name "invalid_file.ts"')
      );
    });

    it('throws RemigrateCliError when version format is incomplete', () => {
      expect(() => getVersionFromFileName('20250615_add_user.ts')).toThrow(
        new RemigrateCliError('Could not extract version from file name "20250615_add_user.ts"')
      );
    });
  });
});
