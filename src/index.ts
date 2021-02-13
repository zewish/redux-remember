import init from './init';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from './action-types';
import { Driver, Options } from './types';
import {
  Action,
  AnyAction,
  Middleware,
  PreloadedState,
  Reducer,
  Store,
  StoreCreator,
  StoreEnhancer
} from 'redux';

const rememberReducer = (reducers: Reducer): Reducer => {
  const data = {
    state: {}
  };

  return (state = data.state, action: AnyAction) => {
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
          { type: REMEMBER_REHYDRATED }
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

const rememberEnhancer = <S, A extends Action, Ext>(
  driver: Driver,
  rememberedKeys: string[],
  {
    prefix = '@persist-',
    serialize = JSON.stringify,
    unserialize = JSON.parse,
    persistThrottle = 100,
    persistWholeStore = false
  }: Partial<Options> = {}
) => {
  if (!driver) {
    throw Error('redux-remember error: driver required');
  }

  if (!Array.isArray(rememberedKeys)) {
    throw Error('redux-remember error: rememberedKeys needs to be an array');
  }

  return (createStore: StoreCreator) => (
    rootReducer: Reducer<S, A>,
    initialState?: PreloadedState<S>,
    enhancer?: StoreEnhancer<Ext>
  ) => {
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
};

export {
  rememberReducer,
  rememberEnhancer,
  REMEMBER_REHYDRATED,
  REMEMBER_PERSISTED
};
