import isEqual from 'lodash.isequal';
import { ExtendedOptions } from './types';

type SaveAllOptions = Pick<
  ExtendedOptions,
  'prefix' | 'driver' | 'serialize'
>;

export const saveAll = (
  state: any,
  oldState: any,
  { prefix, driver, serialize }: SaveAllOptions
) => {
  if (!isEqual(state, oldState)) {
    return driver.setItem(
      `${prefix}state@@`,
      serialize(state)
    );
  }
};

export const saveAllKeyed = (
  state: any,
  oldState: any,
  { prefix, driver, serialize }: SaveAllOptions
) => Promise.all(
  Object.keys(state).map(key => {
    if (isEqual(state[key], oldState[key])) {
      return Promise.resolve();
    }

    return driver.setItem(
      `${prefix}${key}`,
      serialize(state[key])
    );
  })
);

export const persist = async (
  state = {},
  oldState = {},
  {
    prefix,
    driver,
    persistWholeStore,
    serialize
  }: Pick<
    ExtendedOptions,
    'prefix' | 'driver' | 'persistWholeStore' | 'serialize'
  >
) => {
  try {
    const save = persistWholeStore
      ? saveAll
      : saveAllKeyed;

    await save(
      state,
      oldState,
      { prefix, driver, serialize }
    );
  } catch (err) {
    console.warn(
      'redux-remember: persist error',
      err
    );
  }
};
