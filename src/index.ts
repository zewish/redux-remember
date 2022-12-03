import init from './init.js';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from './action-types.js';
import { Driver, Options } from './types.js';
import {
  Action,
  AnyAction,
  PreloadedState,
  Reducer,
  Store,
  StoreCreator,
  StoreEnhancer
} from 'redux';

const rememberReducer = <S = any, A extends Action = AnyAction>(
  reducers: Reducer<S, A>
): Reducer<S, A> => {
  const data: any = {
    state: {}
  };

  return (state: S = data.state, action: any) => {
    if (action.type && (
      action.type === '@@INIT'
      || action.type.startsWith('@@redux/INIT')
    )) {
      data.state = { ...state };
    }

    switch (action.type) {
      case REMEMBER_REHYDRATED:
        data.state = reducers(
          {
            ...data.state,
            ...(action.payload || {})
          },
          { type: REMEMBER_REHYDRATED } as any
        );

        return data.state;

      default:
        return reducers(
          state,
          action
        );
    }
  }
};

const rememberEnhancer = <Ext = {}, StateExt = {}>(
  driver: Driver,
  rememberedKeys: string[],
  {
    prefix = '@@remember-',
    serialize = (data, key) => JSON.stringify(data),
    unserialize = (data, key) => JSON.parse(data),
    persistThrottle = 100,
    persistWholeStore = false
  }: Partial<Options> = {}
): StoreEnhancer<Ext, StateExt> => {
  if (!driver) {
    throw Error('redux-remember error: driver required');
  }

  if (!Array.isArray(rememberedKeys)) {
    throw Error('redux-remember error: rememberedKeys needs to be an array');
  }

  const storeCreator: StoreCreator = <S, A extends Action, Ext>(createStore: StoreCreator) => (
    rootReducer: Reducer<S, A>,
    initialState?: PreloadedState<S>,
    enhancer?: StoreEnhancer<Ext>
  ): Store<S, A> & Ext => {
    const store = createStore(
      rootReducer,
      initialState,
      enhancer
    );

    init(
      store,
      rememberedKeys,
      { driver, prefix, serialize, unserialize, persistThrottle, persistWholeStore }
    );

    return store;
  };

  return storeCreator;
};

export {
  rememberReducer,
  rememberEnhancer,
  REMEMBER_REHYDRATED,
  REMEMBER_PERSISTED
};
