import * as rehydrateModule from '../rehydrate';
import { REMEMBER_REHYDRATED } from '../action-types';
import { Driver } from '../types';

describe('rehydrate.ts', () => {
  let mod: typeof rehydrateModule;

  beforeEach(async () => {
    mod = await import('../rehydrate');
  });

  describe('loadAll()', () => {
    let mockPrefix: string;
    let mockDriver: Driver;

    const exec = (opts = {}) => mod.loadAll({
      rememberedKeys: [],
      prefix: mockPrefix,
      driver: mockDriver,
      unserialize: (o: any) => o,
      ...opts
    });

    beforeEach(() => {
      mockDriver = {
        getItem: jest.fn((key) => `"${key}"`),
        setItem() {}
      };

      mockPrefix = 'pref0.';
    });

    it('should call driver.getItem()', async () => {
      await exec();

      expect(mockDriver.getItem).toHaveBeenCalledWith(
        `${mockPrefix}rootState`
      );
    });

    it('returns an empty object', async () => {
      const res1 = await exec({
        driver: {
          getItem: async () => null
        }
      });

      expect(res1).toEqual({});

      const res2 = await exec({
        driver: {
          getItem: async () => undefined
        }
      });

      expect(res2).toEqual({});
    });

    it('returns unserialized data', async () => {
      const data = {
        keyA: 'bla',
        keyB: 'yay',
        skipMe: 'byebye'
      };

      const res = await exec({
        rememberedKeys: ['keyA', 'keyB'],
        unserialize: () => data
      });

      expect(res).toEqual({
        keyA: 'bla',
        keyB: 'yay'
      });
    });

    it('returns filtered data', async () => {
      const data = {
        keyZ: 'wow',
        skipMe: 'byebye',
        keyY: 'cool',
      };

      const res = await exec({
        rememberedKeys: ['keyZ', 'keyY'],
        driver: {
          getItem: () => Promise.resolve(data)
        },
        unserialize: (o: any) => o
      });

      expect(res).toEqual({
        keyZ: 'wow',
        keyY: 'cool'
      });
    });
  });

  describe('loadAllKeyed()', () => {
    let mockPrefix: string;
    let mockDriver: Driver;

    const exec = (opts = {}) => mod.loadAllKeyed({
      rememberedKeys: [],
      prefix: mockPrefix,
      driver: mockDriver,
      unserialize: (o: any) => o,
      ...opts
    });

    beforeEach(() => {
      mockDriver = {
        getItem: jest.fn((key) => `valueFor:${key.replace(mockPrefix, '')}`),
        setItem() {}
      };

      mockPrefix = 'prefZ.';
    });

    it('should call driver.getItem()', async () => {
      await exec({
        rememberedKeys: ['say', 'what']
      });

      expect(mockDriver.getItem).toHaveBeenNthCalledWith(
        1,
        `${mockPrefix}say`
      );

      expect(mockDriver.getItem).toHaveBeenNthCalledWith(
        2,
        `${mockPrefix}what`
      );
    });

    it('returns unserialized state', async () => {
      const mockUnserialize = jest.fn()
        .mockImplementation((str) => str.toUpperCase());

      const res = await exec({
        rememberedKeys: ['yay', 'k'],
        unserialize: mockUnserialize
      });

      expect(res).toEqual({
        yay: 'VALUEFOR:YAY',
        k: 'VALUEFOR:K'
      });

      expect(mockUnserialize)
        .toHaveBeenNthCalledWith(1, 'valueFor:yay', 'yay');
      expect(mockUnserialize)
        .toHaveBeenNthCalledWith(2, 'valueFor:k', 'k');
    });

    it('returns state filtering null and undefined', async () => {
      const res = await exec({
        rememberedKeys: ['so', 'iAmNull', 'great', 'iAmUndefined'],
        driver: {
          getItem: (
            jest.fn()
              .mockReturnValueOnce('val7')
              .mockReturnValueOnce(null)
              .mockReturnValueOnce('val8')
              .mockReturnValueOnce(undefined)
          )
        }
      });

      expect(res).toEqual({
        so: 'val7',
        great: 'val8'
      });
    });
  });

  describe('rehydrate()', () => {
    let mockState = {};
    const mockStore = {
      dispatch: jest.fn(),
      getState: jest.fn(() => mockState)
    };

    let rememberedKeys: string[];
    let mockPrefix: string;
    let mockDriver: Driver;

    type Opts = Partial<Required<Parameters<typeof mod.rehydrate>[2]>>;
    const exec = (opts: Opts = {}) => mod.rehydrate(
      mockStore as any,
      rememberedKeys,
      {
        prefix: mockPrefix,
        driver: mockDriver,
        errorHandler() {},
        unserialize: (data) => JSON.parse(data),
        persistWholeStore: false,
        ...opts
      }
    );

    beforeEach(() => {
      rememberedKeys = ['3', '2', '1'];

      mockState = {};
      mockStore.dispatch = jest.fn();
      mockStore.getState = jest.fn(() => mockState);

      mockDriver = {
        getItem: jest.fn((key) => `"${key}"`),
        setItem() {}
      };

      mockPrefix = 'pref1.';
    });

    it('propery passes rehydrate errors to errorHandler()', async () => {
      const error1 = 'UH OH ONE!';
      const error2 = 'UH OH TWO!';

      const rehydrateErrorMock = jest.fn((error) => ({
        message: `REHYDRATE ERROR: ${error}`
      }));

      const errorHandlerMock = jest.fn();
      jest.mock('../errors', () => ({
        __esModule: true,
        RehydrateError: rehydrateErrorMock
      }));

      mockDriver.getItem = jest.fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2);

      jest.resetModules();
      mod = await import('../rehydrate');

      await exec({
        errorHandler: errorHandlerMock,
        persistWholeStore: true
      });
      await exec({ errorHandler: errorHandlerMock });

      expect(rehydrateErrorMock).toHaveBeenNthCalledWith(
        1,
        error1
      );

      expect(rehydrateErrorMock).toHaveBeenNthCalledWith(
        2,
        error2
      );

      expect(errorHandlerMock).toHaveBeenNthCalledWith(
        1,
        { message: `REHYDRATE ERROR: ${error1}` }
      );

      expect(errorHandlerMock).toHaveBeenNthCalledWith(
        2,
        { message: `REHYDRATE ERROR: ${error2}` }
      );
    });

    it('calls store.getState()', async () => {
      await exec({
        driver: {
          setItem: () => { throw new Error('not implemented'); },
          getItem: async () => ({})
        },
        unserialize: (o: any) => o,
        persistWholeStore: true
      });

      expect(mockStore.getState).toHaveBeenCalledTimes(1);
    });

    it('calls store.dispatch()', async () => {
      await exec({
        unserialize: (o: any) => JSON.parse(o)
      });

      await exec({
        driver: {
          setItem: () => { throw new Error('not implemented'); },
          getItem: async () => ({
            3: 'zaz',
            2: 'lol',
            100: 'nope'
          })
        },
        unserialize: (o: any) => o,
        persistWholeStore: true
      });

      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, {
        type: REMEMBER_REHYDRATED,
        payload: {
          3: 'pref1.3',
          2: 'pref1.2',
          1: 'pref1.1'
        }
      });

      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, {
        type: REMEMBER_REHYDRATED,
        payload: {
          2: 'lol',
          3: 'zaz'
        }
      });
    });

    it('merges with existing state', async () => {
      mockState = {
        1: 'prev-state-1',
        2: 'prev-state-2'
      };

      await exec({
        driver: {
          setItem: () => { throw new Error('not implemented'); },
          getItem: async () => ({
            3: 'number-3',
            2: 'number-2',
            100: 'skip-me'
          })
        },
        unserialize: (o: any) => o,
        persistWholeStore: true
      });

      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, {
        type: REMEMBER_REHYDRATED,
        payload: {
          3: 'number-3',
          2: 'number-2',
          1: 'prev-state-1'
        }
      });
    });

    it('merges with existing state using the stateReconciler()', async () => {
      mockState = {
        1: {
          1: 'prev-state-sub-1',
          2: 'prev-state-sub-2'
        },
        2: 'prev-state-2'
      };

      await exec({
        stateReconciler: (c, l) => {
          const state = { ...c };

          Object.keys(l).forEach((key) => {
            if (typeof state[key] === 'object' && typeof l[key] === 'object') {
              Object.keys(l[key]).forEach((innerKey) => {
                state[key][innerKey] = l[key][innerKey];
              });
            } else {
              state[key] = l[key];
            }
          });

          return state;
        },
        driver: {
          setItem: () => { throw new Error('not implemented'); },
          getItem: jest.fn()
            .mockReturnValueOnce('number-3')
            .mockReturnValueOnce('prev-state-2')
            .mockReturnValueOnce({
              1: 'loaded-state-sub-1'
            })
        },
        unserialize: (o: any) => o,
      });

      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, {
        type: REMEMBER_REHYDRATED,
        payload: {
          1: {
            1: 'loaded-state-sub-1',
            2: 'prev-state-sub-2'
          },
          2: 'prev-state-2',
          3: 'number-3'
        }
      });
    });
  });
});
