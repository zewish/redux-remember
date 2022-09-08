import { Store } from 'redux';
import { ExtendedOptions } from './types';
import { rehydrate } from './rehydrate';
import { persist } from './persist';
import isEqual from 'lodash.isequal';
import { REMEMBER_PERSISTED } from './action-types';
import { pick, throttle } from './utils';

const init = async (
  store: Store<any, any>,
  rememberedKeys: string[],
  {
    prefix,
    driver,
    serialize,
    unserialize,
    persistThrottle,
    persistWholeStore
  }: ExtendedOptions
) => {
  await rehydrate(
    store,
    rememberedKeys,
    { prefix, driver, unserialize, persistWholeStore }
  );

  let oldState = {};

  store.subscribe(throttle(async () => {
    const state = pick(
      store.getState(),
      rememberedKeys
    );

    await persist(
      state,
      oldState,
      { prefix, driver, serialize, persistWholeStore }
    );

    if (!isEqual(state, oldState)) {
      store.dispatch({
        type: REMEMBER_PERSISTED,
        payload: state
      });
    }

    oldState = state;
  }, persistThrottle));
};

export default init;
