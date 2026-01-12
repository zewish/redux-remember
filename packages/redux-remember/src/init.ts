import type { Store } from 'redux';
import type { ExtendedOptions } from './types.ts';
import { rehydrate } from './rehydrate.ts';
import { persist } from './persist.ts';
import { REMEMBER_PERSISTED } from './action-types.ts';
import { pick, throttle, debounce } from './utils.ts';
import isDeepEqual from './is-deep-equal.ts';

const init = async (
  store: Store<any, any>,
  rememberedKeys: string[],
  {
    prefix,
    driver,
    serialize,
    unserialize,
    migrate,
    persistThrottle,
    persistDebounce,
    persistWholeStore,
    errorHandler,

  }: ExtendedOptions
) => {
  await rehydrate(
    store,
    rememberedKeys,
    { prefix, driver, unserialize, migrate, persistWholeStore, errorHandler }
  );

  let oldState = {};

  const persistFunc = async () => {
    const state = pick(
      store.getState(),
      rememberedKeys
    );

    await persist(
      state,
      oldState,
      { prefix, driver, serialize, persistWholeStore, errorHandler }
    );

    if (!isDeepEqual(state, oldState)) {
      store.dispatch({
        type: REMEMBER_PERSISTED,
        payload: state
      });
    }

    oldState = state;
  };

  if (persistDebounce && persistDebounce > 0) {
    store.subscribe(debounce(persistFunc, persistDebounce));
  } else {
    store.subscribe(throttle(persistFunc, persistThrottle));
  }
};

export default init;
