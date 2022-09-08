import * as indexModule from '../index';
import * as actionTypes from '../action-types';
import { Reducer, StoreCreator } from 'redux';
import { Options } from '../types';

describe('index.ts', () => {
    let mockRehydrate = {
      rehydrateReducer: jest.fn(() => 'REHYDRATE_REDUCER')
    };

    let mockInit: jest.Mock;
    let index: typeof indexModule;

    beforeEach(() => {
      mockRehydrate.rehydrateReducer = jest.fn(() => 'REHYDRATE_REDUCER');
      mockInit = jest.fn(() => {});

      jest.mock('../rehydrate', () => mockRehydrate);
      jest.mock('../init', () => mockInit);

      index = require('../index');
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

      it('does not break when state and action are empty', () => {
        expect(exec(undefined, {})).toEqual(
          {}
        );
      });

      it('returns preloaded state', () => {
        const state = { 'cool': 'state' };

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
      const store = 'dummy store!!!';
      const createStore = jest.fn(() => store) as StoreCreator;
      const rootReducer = () => 'beep';
      const initialState = 'dummyInitialState';
      const enhancer: any = 'dummyEnhancer';

      const enhancerInstance = index.rememberEnhancer(
        {
          getItem() {},
          setItem() {}
        },
        []
      );

      const storeMaker: StoreCreator = enhancerInstance(createStore);
      const res = storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(createStore).toBeCalledWith(
        rootReducer, initialState, enhancer
      );

      expect(res).toEqual(store);
    });

    it('calls init()', () => {
      const store = 'the store!!!';

      const driver = {
        getItem() {},
        setItem() {}
      };

      const rememberedKeys = [ 'zz', 'bb', 'kk' ];

      const rootReducer = () => 'the root of the reducers';
      const initialState = 'yup, initial state';
      const enhancer: any = 'another enhancer';

      const opts: Options = {
        prefix: '@@yay!',
        persistThrottle: 432,
        persistWholeStore: true,
        serialize: (o) => o,
        unserialize: (o) => o
      };

      const storeMaker: StoreCreator = index.rememberEnhancer(
        driver, rememberedKeys, opts
      )((() => store) as StoreCreator);

      storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockInit).toBeCalledWith(
        store,
        rememberedKeys,
        { driver, ...opts }
      )
    });

    it('calls init() with default options', () => {
      let optionDefaults: any;
      mockInit.mockImplementationOnce((store, rememberedKeys, opts) => {
        optionDefaults = opts;
      });
      const store = 'some-store';

      const driver = {
        getItem() {},
        setItem() {}
      };

      const rememberedKeys = [ 'zz', 'bb', 'kk' ];

      const rootReducer = () => 'the root of the reducers';
      const initialState = 'yup, initial state';
      const enhancer: any = 'another enhancer';

      const storeMaker: StoreCreator = index.rememberEnhancer(
        driver, rememberedKeys
      )((() => store) as StoreCreator);

      storeMaker(
        rootReducer, initialState, enhancer
      );

      expect(mockInit).toBeCalledWith(
        store,
        rememberedKeys,
        { driver, ...optionDefaults }
      )

      const stringifySpy = jest.spyOn(JSON, 'stringify');
      const parseSpy = jest.spyOn(JSON, 'parse');

      expect(optionDefaults).toMatchObject({
        prefix : '@@remember-',
        persistThrottle : 100,
        persistWholeStore : false
      });
      expect(optionDefaults.serialize('hello', 'auth')).toEqual('\"hello\"');
      expect(stringifySpy).toHaveBeenCalledWith('hello');
      expect(optionDefaults.unserialize('\"bye\"', 'auth')).toEqual('bye');
      expect(parseSpy).toHaveBeenCalledWith('\"bye\"');
    });
  });
});
