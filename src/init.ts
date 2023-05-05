import { Store } from 'redux';
import { ExtendedOptions } from './types';
import { rehydrate } from './rehydrate';
import { persist } from './persist';
import { REMEMBER_PERSISTED } from './action-types';
import { pick, throttle, debounce } from './utils';
import isDeepEqual from './is-deep-equal';

const init = async (
  store: Store<any, any>,
  rememberedKeys: string[],
  {
    prefix,
    driver,
    serialize,
    unserialize,
    persistThrottle,
    persistDebounce,
    persistWholeStore
  }: ExtendedOptions
) => {
  await rehydrate(
    store,
    rememberedKeys,
    { prefix, driver, unserialize, persistWholeStore }
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
      { prefix, driver, serialize, persistWholeStore }
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
