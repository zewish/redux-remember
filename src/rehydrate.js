import pick from 'lodash.pick';
import { REMEMBER_REHYDRATED } from './action-types';

const REDUX_INIT = '@@INIT';

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

export const rehydrateReducer = (reducers) => {
    const data = {
        state: {}
    };

    return (state = data.state, action = {}) => {
        switch (action.type) {
            case REDUX_INIT: {
                data.state = { ...state };
            }

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
