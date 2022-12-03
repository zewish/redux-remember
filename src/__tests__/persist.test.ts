import * as persistModule from '../persist.js';
import { Driver } from '../types.js';

describe('persist.ts', () => {
  let mockDriver: Driver;
  let mockIsEqual: (a: any, b: any) => boolean;
  let mod: typeof persistModule;

  beforeEach(async () => {
    mockDriver = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };

    mockIsEqual = jest.fn((a, b) => a === b);

    jest.mock('../utils.js', () => ({
      ...jest.requireActual('../utils.js'),
      isEqual: mockIsEqual
    }));

    mod = await import('../persist.js');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('saveAllKeyed()', () => {
    it('calls isEqual()', async () => {
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

      expect(mockIsEqual).nthCalledWith(
        1, 'val1', 'val11'
      );

      expect(mockIsEqual).nthCalledWith(
        2, 'val2', 'val22'
      );
    });

    it('calls serialize()', async () => {
      const mockSerialize = jest.fn();

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

      expect(mockSerialize).nthCalledWith(
        1, 'yay', 'key1'
      );

      expect(mockSerialize).nthCalledWith(
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
          serialize: (string, key) => JSON.stringify(string)
        }
      );

      expect(mockDriver.setItem).nthCalledWith(
        1, 'yada.key1', '"yay"'
      );

      expect(mockDriver.setItem).nthCalledWith(
        2, 'yada.key3', '"wow"'
      );
    });

    it('does not call driver.setItem()', async () => {
      jest.mock('../utils.js', () => ({
        ...jest.requireActual('../utils.js'),
        isEqual: () => true
      }));
      jest.resetModules();

      mod = await import('../persist.js');

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

      expect(mockDriver.setItem).toBeCalledTimes(0);
    });
  });

  describe('saveAll()', () => {
    it('calls isEqual()', async () => {
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
          serialize(state, key) {}
        }
      );

      expect(mockIsEqual).toBeCalledWith(
        state, oldState
      );
    });

    it('calls serialize()', async () => {
      const mockSerialize = jest.fn();

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

      expect(mockSerialize).toBeCalledWith(state, 'rootState');
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

      expect(mockDriver.setItem).toBeCalledWith(
        '@@yada-rootState', state
      );
    });

    it('does not call driver.setItem()', async () => {
      jest.mock('../utils.js', () => ({
        ...jest.requireActual('../utils.js'),
        isEqual: () => true
      }));
      jest.resetModules();

      mod = await import('../persist.js');

      await mod.saveAll(
        { key1: 'changed' },
        { key1: 'not_changed' },
        {
          prefix: '@@yada-',
          driver: mockDriver,
          serialize() {}
        }
      );

      expect(mockDriver.setItem).toBeCalledTimes(0);
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
          serialize: (o: any) => o
        }
      );

      await mod.persist(
        { key1: 'new' },
        { key1: 'old' },
        {
          driver: mockDriver,
          prefix: 'two',
          persistWholeStore: true,
          serialize: (o: any) => o
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
          serialize: (o: any) => o
        }
      );

      await mod.persist(
        undefined,
        undefined,
        {
          driver: mockDriver,
          prefix: 'four',
          persistWholeStore: true,
          serialize: (o: any) => o
        }
      );
    });

    it('calls console.warn()', async () => {
      jest.mock('../utils.js', () => ({
        ...jest.requireActual('../utils.js'),
        isEqual: () => false
      }));
      jest.resetModules();

      mod = await import('../persist.js');

      const error1 = 'DUMMY ERROR 1!!!';
      const error2 = 'DUMMY ERROR 2!!!';

      const mockDriver =  {
        getItem: (key: string) => {},
        setItem: (
          jest.fn()
            .mockRejectedValueOnce(error1)
            .mockRejectedValueOnce(error2)
        )
      };

      const consoleWarn = global.console.warn;
      global.console.warn = jest.fn();

      await mod.persist(
        { key1: 'yay' },
        { key1: 'cool' },
        {
          prefix: 'beep',
          persistWholeStore: false,
          driver: mockDriver,
          serialize: (o: any) => o
        }
      );

      await mod.persist(
        { key1: 'yay' },
        { key1: 'cool' },
        {
          prefix: 'boop',
          driver: mockDriver,
          persistWholeStore: true,
          serialize: (o: any) => o
        }
      );

      expect(global.console.warn).nthCalledWith(
        1,
        'redux-remember: persist error',
        error1
      );

      expect(global.console.warn).nthCalledWith(
        2,
        'redux-remember: persist error',
        error2
      );

      global.console.warn = consoleWarn;
    });
  });
});
