import pick from 'lodash.pick';
import { REMEMBER_REHYDRATED } from './action-types';

export const loadAll = async ({
    persistableKeys,
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
        persistableKeys
    );
};

export const loadAllKeyed = async ({
    persistableKeys,
    driver,
    prefix,
    unserialize
}) => {
    const items = await Promise.all(
        persistableKeys
        .map(key => driver.getItem(
            `${prefix}${key}`
        ))
    );

    return persistableKeys
    .reduce((obj, key, i) => {
        if (items[i] !== null && items[i] !== undefined) {
            obj[key] = unserialize(items[i]);
        }

        return obj;
    }, {});
};

export const rehydrate = async (store, persistableKeys = [], {
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
            persistableKeys,
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

export const rehydrateReducer = (reducers) => (preloaded = {}) => {
    const data = {
        state: preloaded
    };

    return (state = data.state, action = {}) => {
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
