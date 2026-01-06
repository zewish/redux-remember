import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type * as persistModule from '../persist.ts';
import type { Driver } from '../types.ts';

describe('persist.ts', () => {
  let mockDriver: Driver;
  let mockIsDeepEqual: (a: any, b: any) => boolean;
  let mod: typeof persistModule;

  beforeEach(async () => {
    mockDriver = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };

    mockIsDeepEqual = vi.fn((a, b) => a === b);

    vi.doMock('../is-deep-equal.ts', () => ({
      default: mockIsDeepEqual
    }));

    mod = await import('../persist.ts');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('saveAllKeyed()', () => {
    it('calls isDeepEqual()', async () => {
      await mod.saveAllKeyed(
        {
          key1: 'val1',
          key2: 'val2'
        },
        {
          key1: 'val11',
          key2: 'val22'
        },
        {
          prefix: '',
          driver: mockDriver,
          serialize() {}
        }
      );

      expect(mockIsDeepEqual).toHaveBeenNthCalledWith(
        1, 'val1', 'val11'
      );

      expect(mockIsDeepEqual).toHaveBeenNthCalledWith(
        2, 'val2', 'val22'
      );
    });

    it('calls serialize()', async () => {
      const mockSerialize = vi.fn();

      await mod.saveAllKeyed(
        {
          key1: 'yay',
          key2: 'i_am_not_changed',
          key3: 'wow'
        },
        {
          key1: 'cool',
          key2: 'i_am_not_changed',
          key3: 'super'
        },
        {
          prefix: 'yada.',
          driver: mockDriver,
          serialize: mockSerialize
        }
      );

      expect(mockSerialize).toHaveBeenNthCalledWith(
        1, 'yay', 'key1'
      );

      expect(mockSerialize).toHaveBeenNthCalledWith(
        2, 'wow', 'key3'
      );
    });

    it('calls driver.setItem()', async () => {
      await mod.saveAllKeyed(
        {
          key1: 'yay',
          key2: 'i_am_not_changed',
          key3: 'wow'
        },
        {
          key1: 'cool',
          key2: 'i_am_not_changed',
          key3: 'super'
        },
        {
          prefix: 'yada.',
          driver: mockDriver,
          serialize: (string) => JSON.stringify(string)
        }
      );

      expect(mockDriver.setItem).toHaveBeenNthCalledWith(
        1, 'yada.key1', '"yay"'
      );

      expect(mockDriver.setItem).toHaveBeenNthCalledWith(
        2, 'yada.key3', '"wow"'
      );
    });

    it('does not call driver.setItem()', async () => {
      vi.doMock('../is-deep-equal.ts', () => ({
        default: () => true
      }));
      vi.resetModules();

      mod = await import('../persist.ts');

      await mod.saveAllKeyed(
        {
          key1: 'yay',
          key2: 'super',
        },
        {
          key1: 'cool',
          key2: 'lol'
        },
        {
          prefix: '',
          driver: mockDriver,
          serialize() {}
        }
      );

      expect(mockDriver.setItem).toHaveBeenCalledTimes(0);
    });
  });

  describe('saveAll()', () => {
    it('calls isDeepEqual()', async () => {
      const state = {
        key1: 'val1',
        key2: 'val2'
      };

      const oldState = {
        key1: 'val11',
        key2: 'val22'
      };

      await mod.saveAll(
        state,
        oldState,
        {
          prefix: 'bla',
          driver: mockDriver,
          serialize() {}
        }
      );

      expect(mockIsDeepEqual).toHaveBeenCalledWith(
        state, oldState
      );
    });

    it('calls serialize()', async () => {
      const mockSerialize = vi.fn();

      const state = {
        key1: 'not_changed',
        key2: 'i_am_not_changed',
        key3: 'new-changed-value'
      };

      const oldState = {
        key1: 'not_changed',
        key2: 'i_am_not_changed',
        key3: 'old-value'
      };

      await mod.saveAll(
        state,
        oldState,
        {
          prefix: '@@yada-',
          driver: mockDriver,
          serialize: mockSerialize
        }
      );

      expect(mockSerialize).toHaveBeenCalledWith(state, 'rootState');
    });

    it('calls driver.setItem()', async () => {
      const state = {
        key1: 'not_changed',
        key2: 'i_am_not_changed',
        key3: 'new-changed-value'
      };

      const oldState = {
        key1: 'not_changed',
        key2: 'i_am_not_changed',
        key3: 'old-value'
      };

      await mod.saveAll(
        state,
        oldState,
        {
          prefix: '@@yada-',
          driver: mockDriver,
          serialize: (o: any) => o
        }
      );

      expect(mockDriver.setItem).toHaveBeenCalledWith(
        '@@yada-rootState', state
      );
    });

    it('does not call driver.setItem()', async () => {
      vi.doMock('../is-deep-equal.ts', () => ({
        default: () => true
      }));
      vi.resetModules();

      mod = await import('../persist.ts');

      await mod.saveAll(
        { key1: 'changed' },
        { key1: 'not_changed' },
        {
          prefix: '@@yada-',
          driver: mockDriver,
          serialize() {}
        }
      );

      expect(mockDriver.setItem).toHaveBeenCalledTimes(0);
    });
  });

  describe('persist()', () => {
    it('works with state objects provided', async () => {
      await mod.persist(
        { key1: 'new' },
        { key1: 'old' },
        {
          driver: mockDriver,
          prefix: 'one',
          persistWholeStore: false,
          serialize: (o: any) => o,
          errorHandler() {}
        }
      );

      await mod.persist(
        { key1: 'new' },
        { key1: 'old' },
        {
          driver: mockDriver,
          prefix: 'two',
          persistWholeStore: true,
          serialize: (o: any) => o,
          errorHandler() {}
        }
      );
    });

    it('works without state objects provided', async () => {
      await mod.persist(
        undefined,
        undefined,
        {
          driver: mockDriver,
          prefix: 'three',
          persistWholeStore: false,
          serialize: (o: any) => o,
          errorHandler() {}
        }
      );

      await mod.persist(
        undefined,
        undefined,
        {
          driver: mockDriver,
          prefix: 'four',
          persistWholeStore: true,
          serialize: (o: any) => o,
          errorHandler() {}
        }
      );
    });

    it('propery passes persist errors to errorHandler()', async () => {
      const error1 = 'DUMMY ERROR 1!!!';
      const error2 = 'DUMMY ERROR 2!!!';

      const persistErrorMock = vi.fn();
      class MockPersistError {
        message: string;
        constructor(error: any) {
          persistErrorMock(error);
          this.message = `PERSIST ERROR: ${error}`;
        }
      }

      const errorHandlerMock = vi.fn();

      vi.doMock('../errors.ts', () => ({
        PersistError: MockPersistError
      }));

      vi.doMock('../is-deep-equal.ts', () => ({
        default: () => false
      }));

      vi.resetModules();
      mod = await import('../persist.ts');

      mockDriver = {
        getItem() {},
        setItem: (
          vi.fn()
            .mockRejectedValueOnce(error1)
            .mockRejectedValueOnce(error2)
        )
      };

      await mod.persist(
        { key1: 'yay' },
        { key1: 'cool' },
        {
          prefix: 'beep',
          persistWholeStore: false,
          driver: mockDriver,
          serialize: (o: any) => o,
          errorHandler: errorHandlerMock
        }
      );

      await mod.persist(
        { key1: 'yay' },
        { key1: 'cool' },
        {
          prefix: 'boop',
          driver: mockDriver,
          persistWholeStore: true,
          serialize: (o: any) => o,
          errorHandler: errorHandlerMock
        }
      );

      expect(persistErrorMock).toHaveBeenNthCalledWith(
        1,
        error1
      );

      expect(persistErrorMock).toHaveBeenNthCalledWith(
        2,
        error2
      );

      expect(errorHandlerMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ message: `PERSIST ERROR: ${error1}` })
      );

      expect(errorHandlerMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ message: `PERSIST ERROR: ${error2}` })
      );
    });
  });
});
