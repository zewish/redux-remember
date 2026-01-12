import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import type * as indexModule from '../index.ts';
import * as actionTypes from '../action-types.ts';
import type { Reducer, ReducersMapObject, StoreCreator } from 'redux';
import type { Options } from '../types.ts';

describe('index.ts', () => {
  const mockRehydrate = {
    rehydrateReducer: vi.fn(() => 'REHYDRATE_REDUCER')
  };

  let mockInit: Mock;
  let mockCombineReducers: Mock;
  let index: typeof indexModule;

  beforeEach(async () => {
    mockRehydrate.rehydrateReducer = vi.fn(() => 'REHYDRATE_REDUCER');
    mockInit = vi.fn(() => {});
    mockCombineReducers = vi.fn(() => {});

    vi.doMock('../rehydrate.ts', () => mockRehydrate);
    vi.doMock('../init.ts', () => ({ default: mockInit }));
    vi.doMock('redux', async () => {
      return {
        ...(await vi.importActual('redux')),
        combineReducers: mockCombineReducers
      };
    });

    index = await import('../index.ts');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('exports proper items', () => {
    expect(index.REMEMBER_REHYDRATED).toEqual(
      actionTypes.REMEMBER_REHYDRATED
    );

    expect(index.REMEMBER_PERSISTED).toEqual(
      actionTypes.REMEMBER_PERSISTED
    );

    expect(typeof index.rememberReducer).toBe(
      'function'
    );

    expect(typeof index.rememberEnhancer).toBe(
      'function'
    );
  });

  describe('rememberReducer()', () => {
    let mockReducer: Reducer;

    const exec = (state: any, action: any) => (
      index.rememberReducer(mockReducer)(state, action)
    );

    beforeEach(() => {
      mockReducer = vi.fn((state: any) => state);
    });

    it('call combineReducers()', () => {
      const reducersObj: ReducersMapObject<any, any> = {
        dummy: () => 'test123'
      };

      const mockState = { dummy: 'test' };
      mockCombineReducers.mockReturnValue(() => mockState);

      expect(index.rememberReducer(reducersObj)(undefined, { type: 'TEST' })).toEqual(
        mockState
      );

      expect(mockCombineReducers).toHaveBeenCalledWith(reducersObj);
    });

    it('does not break when state and action are empty', () => {
      expect(exec(undefined, {})).toEqual(
        {}
      );
    });

    it('returns preloaded state', () => {
      const state = { cool: 'state' };

      expect(exec(state, { type: '@@INIT' })).toEqual(
        state
      );

      expect(exec(state, { type: '@@redux/INIT.12345' })).toEqual(
        state
      );
    });

    it('returns rehydrated state', () => {
      const payload = {
        wow: 'beep',
        nah: 'lol'
      };

      expect(exec(
        null,
        {
          type: actionTypes.REMEMBER_REHYDRATED,
          payload
        }
      )).toEqual(payload);
    });

    it('does not fail if there is missing payload', () => {
      expect(exec(
        null,
        { type: actionTypes.REMEMBER_REHYDRATED }
      )).toEqual({});
    });
  });

  describe('rememberEnhancer()', () => {
    const mockDriver = {
      getItem() {},
      setItem() {}
    };

    let mockCreateStore: StoreCreator;
    const mockStore = 'my-mocked-store';
    const rememberedKeys = ['zz', 'bb', 'kk'];
    const rootReducer = (state = {}) => state;
    let rootReducerWrapper: Reducer;
    const initialState = { myReducer: 'bla' };
    const enhancer: any = 'dummy enhancer';

    beforeEach(() => {
      mockCreateStore = vi.fn((wrapper) => {
        rootReducerWrapper = wrapper;
        return mockStore;
      }) as StoreCreator;
    });

    it('calls createStore function and returns its result', () => {
      const enhancerInstance = index.rememberEnhancer(
        mockDriver,
        []
      );

      const storeMaker: StoreCreator = enhancerInstance(mockCreateStore);
      const res = storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockCreateStore).toHaveBeenCalledWith(
        expect.any(Function), initialState, enhancer
      );

      expect(res).toEqual(mockStore);
    });

    it('calls init()', () => {
      const opts: Options = {
        prefix: '@@yay!',
        persistThrottle: 432,
        persistWholeStore: true,
        serialize: (o) => o,
        unserialize: (o) => o,
        migrate: (s) => s,
        errorHandler() {}
      };

      const storeMaker: StoreCreator = index.rememberEnhancer(
        mockDriver, rememberedKeys, opts
      )((() => mockStore) as StoreCreator);

      storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockInit).toHaveBeenCalledWith(
        mockStore,
        rememberedKeys,
        { driver: mockDriver, ...opts }
      );
    });

    it('calls init() with default options', () => {
      let optionDefaults: any;
      mockInit.mockImplementationOnce((_store, _rememberedKeys, opts) => {
        optionDefaults = opts;
      });

      const storeMaker: StoreCreator = index.rememberEnhancer(
        mockDriver, rememberedKeys
      )((() => mockStore) as StoreCreator);

      storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockInit).toHaveBeenCalledWith(
        mockStore,
        rememberedKeys,
        { driver: mockDriver, ...optionDefaults }
      );

      const stringifySpy = vi.spyOn(JSON, 'stringify');
      const parseSpy = vi.spyOn(JSON, 'parse');

      expect(optionDefaults).toMatchObject({
        prefix: '@@remember-',
        persistThrottle: 100,
        persistWholeStore: false
      });
      expect(optionDefaults.serialize('hello', 'auth')).toEqual('"hello"');
      expect(stringifySpy).toHaveBeenCalledWith('hello');
      expect(optionDefaults.unserialize('"bye"', 'auth')).toEqual('bye');
      expect(parseSpy).toHaveBeenCalledWith('"bye"');
      expect(optionDefaults.migrate('unchanged')).toBe('unchanged');
    });

    it('calls init() only once after the init action is dispatched', () => {
      vi.useFakeTimers();

      const initActionType = 'WAIT_FOR_ME_BEFORE_INIT';
      const opts: Options = {
        prefix: '@@very-cool-prefix!',
        persistThrottle: 42,
        persistWholeStore: true,
        serialize: (o) => o,
        unserialize: (o) => o,
        migrate: (s) => s,
        errorHandler() {}
      };

      const storeMaker: StoreCreator = index.rememberEnhancer(
        mockDriver, rememberedKeys, { ...opts, initActionType }
      )(mockCreateStore);

      storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockInit).not.toHaveBeenCalled();
      rootReducerWrapper({}, { type: initActionType });
      vi.advanceTimersByTime(1);

      expect(mockInit).toHaveBeenCalledWith(
        mockStore,
        rememberedKeys,
        { driver: mockDriver, ...opts }
      );

      rootReducerWrapper({}, { type: initActionType });
      expect(mockInit).toHaveBeenCalledTimes(1);

      vi.clearAllTimers();
      vi.useRealTimers();
    });
  });
});
