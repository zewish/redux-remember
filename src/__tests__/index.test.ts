import * as indexModule from '../index';
import * as actionTypes from '../action-types';
import { Reducer, ReducersMapObject, StoreCreator } from 'redux';
import { Options } from '../types';

describe('index.ts', () => {
  const mockRehydrate = {
    rehydrateReducer: jest.fn(() => 'REHYDRATE_REDUCER')
  };

  let mockInit: jest.Mock;
  let mockCombineReducers: jest.Mock;
  let index: typeof indexModule;

  beforeEach(async () => {
    mockRehydrate.rehydrateReducer = jest.fn(() => 'REHYDRATE_REDUCER');
    mockInit = jest.fn(() => {});
    mockCombineReducers = jest.fn(() => {});

    jest.mock('../rehydrate', () => mockRehydrate);
    jest.mock('../init', () => mockInit);
    jest.mock('redux', () => ({
      ...jest.requireActual('redux'),
      combineReducers: mockCombineReducers
    }));

    index = await import('../index');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
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
      mockReducer = jest.fn((state: any, action: any) => state);
    });

    it('call combineReducers()', async () => {
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
      mockCreateStore = jest.fn((wrapper) => {
        rootReducerWrapper = wrapper;
        return mockStore;
      }) as StoreCreator;
    });

    it('throws when no driver', () => {
      expect(() => index.rememberEnhancer(undefined as any, undefined as any, {} as any)).toThrow(
        'redux-remember error: driver required'
      );
    });

    it('throws when rememberedKeys is not an array', () => {
      expect(() => index.rememberEnhancer({} as any, undefined as any, {} as any)).toThrow(
        'redux-remember error: rememberedKeys needs to be an array'
      );
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
        unserialize: (o) => o
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

      const stringifySpy = jest.spyOn(JSON, 'stringify');
      const parseSpy = jest.spyOn(JSON, 'parse');

      expect(optionDefaults).toMatchObject({
        prefix: '@@remember-',
        persistThrottle: 100,
        persistWholeStore: false
      });
      expect(optionDefaults.serialize('hello', 'auth')).toEqual('"hello"');
      expect(stringifySpy).toHaveBeenCalledWith('hello');
      expect(optionDefaults.unserialize('"bye"', 'auth')).toEqual('bye');
      expect(parseSpy).toHaveBeenCalledWith('"bye"');
    });

    it('does not call init() until init action is dispatched', () => {
      jest.useFakeTimers();

      const initActionType = 'WAIT_FOR_ME_BEFORE_INIT';
      const opts: Options = {
        prefix: '@@very-cool-prefix!',
        persistThrottle: 42,
        persistWholeStore: true,
        serialize: (o) => o,
        unserialize: (o) => o
      };

      const storeMaker: StoreCreator = index.rememberEnhancer(
        mockDriver, rememberedKeys, { ...opts, initActionType }
      )(mockCreateStore);

      storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockInit).not.toHaveBeenCalled();
      rootReducerWrapper({}, { type: initActionType });
      jest.advanceTimersByTime(1);

      expect(mockInit).toHaveBeenCalledWith(
        mockStore,
        rememberedKeys,
        { driver: mockDriver, ...opts }
      );

      jest.clearAllTimers();
      jest.useRealTimers();
    });
  });
});
