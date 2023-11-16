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

      expect(mockDriver.getItem).toBeCalledWith(
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

      expect(mockDriver.getItem).nthCalledWith(
        1,
        `${mockPrefix}say`
      );

      expect(mockDriver.getItem).nthCalledWith(
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
        .nthCalledWith(1, 'valueFor:yay', 'yay');
      expect(mockUnserialize)
        .nthCalledWith(2, 'valueFor:k', 'k');
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

    const exec = (opts = {}) => mod.rehydrate(
      mockStore as any,
      rememberedKeys,
      {
        prefix: mockPrefix,
        driver: mockDriver,
        ...opts
      } as any
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

    it('calls console.warn()', async () => {
      const error = 'UH OH! OH NO!';

      const consoleWarn = global.console.warn;
      global.console.warn = jest.fn();

      mockDriver.getItem = () => Promise.reject(error);

      await exec();
      await exec({ persistWholeStore: true });

      expect(global.console.warn).nthCalledWith(
        1,
        'redux-remember: rehydrate error',
        error
      );

      expect(global.console.warn).nthCalledWith(
        2,
        'redux-remember: rehydrate error',
        error
      );

      global.console.warn = consoleWarn;
    });

    it('calls store.getState()', async () => {
      await exec({
        driver: {
          getItem: async () => ({})
        },
        unserialize: (o: any) => o,
        persistWholeStore: true
      });

      expect(mockStore.getState).toBeCalledTimes(1);
    });

    it('calls store.dispatch()', async () => {
      await exec({
        unserialize: (o: any) => JSON.parse(o)
      });

      await exec({
        driver: {
          getItem: async () => ({
            3: 'zaz',
            2: 'lol',
            100: 'nope'
          })
        },
        unserialize: (o: any) => o,
        persistWholeStore: true
      });

      expect(mockStore.dispatch).nthCalledWith(1, {
        type: REMEMBER_REHYDRATED,
        payload: {
          3: 'pref1.3',
          2: 'pref1.2',
          1: 'pref1.1'
        }
      });

      expect(mockStore.dispatch).nthCalledWith(2, {
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
          getItem: async () => ({
            3: 'number-3',
            2: 'number-2',
            100: 'skip-me'
          })
        },
        unserialize: (o: any) => o,
        persistWholeStore: true
      });

      expect(mockStore.dispatch).nthCalledWith(1, {
        type: REMEMBER_REHYDRATED,
        payload: {
          3: 'number-3',
          2: 'number-2',
          1: 'prev-state-1'
        }
      });
    });
  });
});
