import init from './init.ts';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from './action-types.ts';
import type { Driver, Options } from './types.ts';
import type {
  Action,
  StoreEnhancer,
  Reducer,
  Store,
  StoreCreator,
  ReducersMapObject,
  UnknownAction
} from 'redux';
import { combineReducers } from 'redux';

export * from './errors.ts';
export * from './types.ts';

const rememberReducer = <S = any, A extends Action = UnknownAction, PreloadedState = S>(
  reducer: Reducer<S, A, PreloadedState> | ReducersMapObject<S, A, PreloadedState>
): Reducer<S, A, PreloadedState> => {
  const data: any = {
    state: {}
  };

  return (state: any = data.state, action: any) => {
    if (action.type && (
      action?.type === '@@INIT'
      || action?.type?.startsWith('@@redux/INIT')
    )) {
      data.state = { ...state };
    }

    const rootReducer = typeof reducer === 'function'
      ? reducer
      : combineReducers(reducer);

    switch (action.type) {
      case REMEMBER_REHYDRATED: {
        const rehydratedState = {
          ...state,
          ...(action?.payload || {})
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

const rememberEnhancer = <Ext extends {} = {}, StateExt extends {} = {}>(
  driver: Driver,
  rememberedKeys: string[],
  {
    prefix = '@@remember-',
    serialize = (data) => JSON.stringify(data),
    unserialize = (data) => JSON.parse(data),
    migrate = (state) => state,
    persistThrottle = 100,
    persistDebounce,
    persistWholeStore = false,
    initActionType,
    errorHandler = console.warn
  }: Partial<Options> = {}
): StoreEnhancer<Ext, StateExt> => {
  const storeCreator = (createStore: StoreCreator): StoreCreator => (
    rootReducer: Reducer<any>,
    preloadedState?: any,
    enhancer?: StoreEnhancer
  ): Store => {
    let isInitialized = false;
    const initialize = (store: Store) => init(
      store,
      rememberedKeys,
      {
        driver,
        prefix,
        serialize,
        unserialize,
        migrate,
        persistThrottle,
        persistDebounce,
        persistWholeStore,
        errorHandler
      }
    );

    const store = createStore(
      (state, action) => {
        if (!isInitialized
          && initActionType
          && action.type === initActionType
        ) {
          isInitialized = true;
          setTimeout(() => initialize(store), 0);
        }

        return rootReducer(state, action);
      },
      preloadedState,
      enhancer
    );

    if (!initActionType) {
      isInitialized = true;
      void initialize(store);
    }

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
