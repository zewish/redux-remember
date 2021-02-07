import { Driver } from '../types';

describe('persist.js', () => {
  let mockDriver: Driver;
  let mockIsEqual: (a: any, b: any) => boolean;
  let mod: any;

  beforeEach(() => {
    mockDriver = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };

    mockIsEqual = jest.fn((a, b) => a === b);

    jest.mock(
      'lodash.isequal',
      () => mockIsEqual
    );

    mod = require('../persist');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('saveAllKeyed()', () => {
    it('calls lodash.isequal()', async () => {
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
        1, 'yay'
      );

      expect(mockSerialize).nthCalledWith(
        2, 'wow'
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
          serialize: JSON.stringify
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
      jest.mock('lodash.isequal', () => () => true);
      jest.resetModules();

      mod = require('../persist');

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
          driver: mockDriver,
          serialize() {}
        }
      );

      expect(mockDriver.setItem).not.toHaveBeenCalled();
    });
  });

  describe('saveAll()', () => {
      it('calls lodash.isequal()', async () => {
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
                  driver: mockDriver,
                  serialize() {}
              }
          );

          mockIsEqual.should.be.calledWith(
              state, oldState
          );
      });

      // it('calls serialize()', async () => {
      //     const mockSerialize = spy(() => {});

      //     const state = {
      //         key1: 'not_changed',
      //         key2: 'i_am_not_changed',
      //         key3: 'new-changed-value'
      //     };

      //     const oldState = {
      //         key1: 'not_changed',
      //         key2: 'i_am_not_changed',
      //         key3: 'old-value'
      //     };

      //     await mod.saveAll(
      //         state,
      //         oldState,
      //         {
      //             prefix: '@@yada-',
      //             driver: mockDriver,
      //             serialize: mockSerialize
      //         }
      //     );

      //     mockSerialize.should.be.calledWith(state);
      // });

      // it('calls driver.setItem()', async () => {
      //     const state = {
      //         key1: 'not_changed',
      //         key2: 'i_am_not_changed',
      //         key3: 'new-changed-value'
      //     };

      //     const oldState = {
      //         key1: 'not_changed',
      //         key2: 'i_am_not_changed',
      //         key3: 'old-value'
      //     };

      //     await mod.saveAll(
      //         state,
      //         oldState,
      //         {
      //             prefix: '@@yada-',
      //             driver: mockDriver,
      //             serialize: (o) => o
      //         }
      //     );

      //     mockDriver.setItem.should.be.calledWith(
      //         '@@yada-state@@', state
      //     );
      // });

      // it('does not call driver.setItem()', async () => {
      //     jest.mock('lodash.isequal', () => () => true);
      //     jest.resetModules();

      //     mod = require('../persist');

      //     await mod.saveAll(
      //         { key1: 'changed' },
      //         { key1: 'not_changed' },
      //         {
      //             prefix: '@@yada-',
      //             driver: mockDriver,
      //             serialize() {}
      //         }
      //     );

      //     mockDriver.setItem.callCount.should.equal(0);
      // });
  });

  // describe('persist()', () => {
  //     it('works with state objects provided', async () => {
  //         await mod.persist(
  //             { key1: 'new' },
  //             { key1: 'old' },
  //             { driver: mockDriver }
  //         );

  //         await mod.persist(
  //             { key1: 'new' },
  //             { key1: 'old' },
  //             { driver: mockDriver, persistWholeStore: false }
  //         );

  //         await mod.persist(
  //             { key1: 'new' },
  //             { key1: 'old' },
  //             { driver: mockDriver, persistWholeStore: true }
  //         );
  //     });

  //     it('works without state objects provided', async () => {
  //         await mod.persist(
  //             undefined,
  //             undefined,
  //             { driver: mockDriver, persistWholeStore: false }
  //         );

  //         await mod.persist(
  //             undefined,
  //             undefined,
  //             { driver: mockDriver, persistWholeStore: true }
  //         );
  //     });

  //     it('calls console.warn()', async () => {
  //         jest.mock('lodash.isequal', () => () => false);
  //         jest.resetModules();

  //         mod = require('../persist');

  //         const error1 = 'DUMMY ERROR 1!!!';
  //         const error2 = 'DUMMY ERROR 2!!!';

  //         const mockDriver =  {
  //             setItem: (
  //                 jest.fn()
  //                 .mockRejectedValueOnce(error1)
  //                 .mockRejectedValueOnce(error2)
  //             )
  //         };

  //         const consoleWarn = global.console.warn;
  //         global.console.warn = spy(() => {});

  //         await mod.persist(
  //             { key1: 'yay' },
  //             { key1: 'cool' },
  //             { driver: mockDriver }
  //         );

  //         await mod.persist(
  //             { key1: 'yay' },
  //             { key1: 'cool' },
  //             { driver: mockDriver, persistWholeStore: true }
  //         );

  //         global.console.warn.firstCall.should.be.calledWith(
  //             'redux-remember: persist error',
  //             error1
  //         );

  //         global.console.warn.secondCall.should.be.calledWith(
  //             'redux-remember: persist error',
  //             error2
  //         );

  //         global.console.warn = consoleWarn;
  //     });
  // });
});
