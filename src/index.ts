import init from './init';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from './action-types';
import { Driver, Options } from './types';
import {
  Action,
  AnyAction,
  PreloadedState,
  StoreEnhancer,
  Reducer,
  Store,
  StoreCreator,
  ReducersMapObject,
  combineReducers
} from 'redux';

export * from './types';

const rememberReducer = <S = any, A extends Action = AnyAction>(
  reducer: Reducer<S, A> | ReducersMapObject<S, A>
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

    const rootReducer = typeof reducer === 'function'
      ? reducer
      : combineReducers(reducer) as Reducer<S, A>;

    switch (action.type) {
      case REMEMBER_REHYDRATED: {
        const rehydratedState = {
          ...data.state,
          ...(action.payload || {})
        };

        data.state = rootReducer(
          rehydratedState,
          {
            type: REMEMBER_REHYDRATED,
            payload: rehydratedState
          } as any
        );

        return data.state;
      }
      default:
        return rootReducer(
          state,
          action
        );
    }
  };
};

const rememberEnhancer = <Ext = {}, StateExt = {}>(
  driver: Driver,
  rememberedKeys: string[],
  {
    prefix = '@@remember-',
    serialize = (data, key) => JSON.stringify(data),
    unserialize = (data, key) => JSON.parse(data),
    persistThrottle = 100,
    persistDebounce,
    persistWholeStore = false
  }: Partial<Options> = {}
): StoreEnhancer<Ext, StateExt> => {
  if (!driver) {
    throw Error('redux-remember error: driver required');
  }

  if (!Array.isArray(rememberedKeys)) {
    throw Error('redux-remember error: rememberedKeys needs to be an array');
  }

  const storeCreator = (createStore: StoreCreator): StoreCreator => (
    rootReducer: Reducer,
    initialState?: PreloadedState<any>,
    enhancer?: StoreEnhancer
  ): Store => {
    const store = createStore(
      rootReducer,
      initialState,
      enhancer
    );

    init(
      store,
      rememberedKeys,
      {
        driver,
        prefix,
        serialize,
        unserialize,
        persistThrottle,
        persistDebounce,
        persistWholeStore
      }
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
