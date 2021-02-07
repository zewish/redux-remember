import pick from 'lodash.pick';
import { Store } from 'redux';
import { REMEMBER_REHYDRATED } from './action-types';
import { ExtendedOptions } from './types';

type RehydrateOptions = Pick<
  ExtendedOptions,
  'prefix' | 'driver' | 'persistWholeStore' | 'unserialize'
>

type LoadAllOptions = Pick<
  ExtendedOptions,
  'driver' | 'prefix' | 'unserialize'
> & {
  rememberedKeys: string[]
};

export const loadAll = async ({
  rememberedKeys,
  driver,
  prefix,
  unserialize
}: LoadAllOptions) => {
  const data = await driver.getItem(
    `${prefix}state@@`
  );

  if (data === null || data == undefined) {
    return {};
  }

  return pick(
    unserialize(data),
    rememberedKeys
  );
};

export const loadAllKeyed = async ({
  rememberedKeys,
  driver,
  prefix,
  unserialize
}: LoadAllOptions) => {
  const items = await Promise.all(
    rememberedKeys.map(key => driver.getItem(
      `${prefix}${key}`
    ))
  );

  return rememberedKeys.reduce((obj, key, i) => {
    if (items[i] !== null && items[i] !== undefined) {
      obj[key] = unserialize(items[i]);
    }

    return obj;
  }, {});
};

export const rehydrate = async (
  store: Store,
  rememberedKeys: string[],
  {
    prefix,
    driver,
    persistWholeStore,
    unserialize = (str: any) => JSON.parse(str)
  }: RehydrateOptions
) => {
  let state = {};

  try {
    const load = persistWholeStore
      ? loadAll
      : loadAllKeyed;

    state = await load({
      rememberedKeys,
      driver,
      prefix,
      unserialize
    });
  } catch (err) {
    console.warn(
      'redux-remember: rehydrate error',
      err
    );
  }

  store.dispatch({
    type: REMEMBER_REHYDRATED,
    payload: state
  });
};
