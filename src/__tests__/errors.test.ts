import { PersistError, RehydrateError } from '../errors';

describe('errors.ts', () => {
  const extractParentErrorStack = (errorInstance: Error): string => {
    const stackLines = errorInstance.stack!.split('\n');
    return stackLines
      .slice(2, stackLines.length)
      .join('\n');
  };

  describe('PersistError', () => {
    it('extends Error', () => {
      const instance = new PersistError(new Error());

      expect(instance).toBeInstanceOf(Error);
      expect(instance).toBeInstanceOf(PersistError);
      expect(instance.message).toEqual('redux-remember: persist error');
    });

    it('copies the stack trace of wrapped Error', () => {
      const error = new Error('ERROR 1');
      const instance = new PersistError(error);
      const instanceMessage = instance.stack!.slice(
        0,
        instance.stack!.indexOf('\n')
      );

      expect(instanceMessage).toEqual(`PersistError: ${instance.message}`);
      expect(extractParentErrorStack(instance)).toEqual(error.stack);
    });

    it('does not break when an invalid error is wrapped', () => {
      expect(new PersistError({ invalid: 'error1' })).toBeInstanceOf(PersistError);
    });
  });

  describe('RehydrateError', () => {
    it('extends Error', () => {
      const instance = new RehydrateError(new Error());

      expect(instance).toBeInstanceOf(Error);
      expect(instance).toBeInstanceOf(RehydrateError);
      expect(instance.message).toEqual('redux-remember: rehydrate error');
    });

    it('copies the stack trace of wrapped Error', () => {
      const error = new Error('ERROR 2');
      const instance = new RehydrateError(error);
      const instanceMessage = instance.stack!.slice(
        0,
        instance.stack!.indexOf('\n')
      );

      expect(instanceMessage).toEqual(`RehydrateError: ${instance.message}`);
      expect(extractParentErrorStack(instance)).toEqual(error.stack);
    });

    it('does not break when an invalid error is wrapped', () => {
      expect(new PersistError({ invalid: 'error2' })).toBeInstanceOf(PersistError);
    });
  });
});
