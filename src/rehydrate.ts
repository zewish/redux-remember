import { Store } from 'redux';
import { REMEMBER_REHYDRATED } from './action-types';
import { ExtendedOptions } from './types';
import { pick } from './utils';
import { RehydrateError } from './errors';

type RehydrateOptions = Pick<
  ExtendedOptions,
  'driver' | 'prefix' | 'unserialize' | 'persistWholeStore' | 'errorHandler'
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
}: LoadAllOptions): Promise<Record<string, any>> => {
  const key = 'rootState';
  const data = await driver.getItem(`${prefix}${key}`);

  if (data === null || data === undefined) {
    return {};
  }

  return pick(
    unserialize(data, key),
    rememberedKeys
  );
};

export const loadAllKeyed = async ({
  rememberedKeys,
  driver,
  prefix,
  unserialize
}: LoadAllOptions): Promise<Record<string, any>> => {
  const items = await Promise.all(
    rememberedKeys.map((key) => driver.getItem(
      `${prefix}${key}`
    ))
  );

  return rememberedKeys.reduce((obj: Record<string, any>, key, i) => {
    if (items[i] !== null && items[i] !== undefined) {
      obj[key] = unserialize(items[i], key);
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
    unserialize,
    errorHandler
  }: RehydrateOptions
) => {
  let state = store.getState();

  try {
    const load = persistWholeStore
      ? loadAll
      : loadAllKeyed;

    state = {
      ...state,
      ...await load({
        rememberedKeys,
        driver,
        prefix,
        unserialize
      })
    };
  } catch (err) {
    errorHandler(new RehydrateError(err));
  }

  store.dispatch({
    type: REMEMBER_REHYDRATED,
    payload: state
  });
};
