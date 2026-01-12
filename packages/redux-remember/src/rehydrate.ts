import type { Store } from 'redux';
import { REMEMBER_REHYDRATED } from './action-types.ts';
import type { ExtendedOptions } from './types.ts';
import { pick } from './utils.ts';
import { RehydrateError } from './errors.ts';

type RehydrateOptions = Pick<
  ExtendedOptions,
  'driver' | 'prefix' | 'unserialize' | 'persistWholeStore' | 'errorHandler' | 'migrate'
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
    errorHandler,
    migrate
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

    state = migrate(state);
  } catch (err) {
    errorHandler(new RehydrateError(err));
  }

  store.dispatch({
    type: REMEMBER_REHYDRATED,
    payload: state
  });
};
