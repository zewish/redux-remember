import { describe, it, expect } from 'vitest';
import { PersistError, RehydrateError } from '../errors.ts';

describe('errors.ts', () => {
  describe('PersistError', () => {
    it('extends Error', () => {
      const error = new Error('ERROR 1-0');
      const instance = new PersistError(error);

      expect(instance).toBeInstanceOf(Error);
      expect(instance).toBeInstanceOf(PersistError);
      expect(instance.originalError).toEqual(error);
      expect(instance.message).toEqual(`${error.name}: ${error.message}`);
    });

    it('copies the stack trace of wrapped Error', () => {
      const error = new Error('ERROR 1-1');
      const errorStackLines = error.stack!.split('\n');
      const errorStackOnly = errorStackLines
        .slice(1, errorStackLines.length)
        .join('\n');

      const instance = new PersistError(error);
      const instanceStackLine1 = instance.stack!.split('\n')[1];

      expect(instance.stack).toEqual(
        `PersistError: Error: ${error.message}\n`
        + `${instanceStackLine1}\n`
        + `${errorStackOnly}`
      );
    });

    it('does not break when an invalid error is wrapped', () => {
      expect(new PersistError({ invalid: 'error1' })).toBeInstanceOf(PersistError);
    });
  });

  describe('RehydrateError', () => {
    it('extends Error', () => {
      const error = new Error('ERROR 2-0');
      const instance = new RehydrateError(error);

      expect(instance).toBeInstanceOf(Error);
      expect(instance).toBeInstanceOf(RehydrateError);
      expect(instance.originalError).toEqual(error);
      expect(instance.message).toEqual(`${error.name}: ${error.message}`);
    });

    it('copies the stack trace of wrapped Error', () => {
      const error = new Error('ERROR 1-1');
      const errorStackLines = error.stack!.split('\n');
      const errorStackOnly = errorStackLines
        .slice(1, errorStackLines.length)
        .join('\n');

      const instance = new RehydrateError(error);
      const instanceStackLine1 = instance.stack!.split('\n')[1];

      expect(instance.stack).toEqual(
        `RehydrateError: Error: ${error.message}\n`
        + `${instanceStackLine1}\n`
        + `${errorStackOnly}`
      );
    });

    it('does not break when an invalid error is wrapped', () => {
      expect(new PersistError({ invalid: 'error2' })).toBeInstanceOf(PersistError);
    });
  });
});
