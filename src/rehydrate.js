import pick from 'lodash.pick';
import { REMEMBER_REHYDRATED } from './action-types';

export const loadAll = async ({
    rememberedKeys,
    driver,
    prefix,
    unserialize
}) => {
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
}) => {
    const items = await Promise.all(
        rememberedKeys
        .map(key => driver.getItem(
            `${prefix}${key}`
        ))
    );

    return rememberedKeys
    .reduce((obj, key, i) => {
        if (items[i] !== null && items[i] !== undefined) {
            obj[key] = unserialize(items[i]);
        }

        return obj;
    }, {});
};

export const rehydrate = async (store, rememberedKeys = [], {
    prefix,
    driver,
    persistWholeStore,
    unserialize = (str) => JSON.parse(str)
}) => {
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
    }
    catch (err) {
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
