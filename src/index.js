import {
    createStore as reduxCreateStore,
    combineReducers as reduxCombineReducers
} from 'redux';

import {
    rehydrateReducer,
    REMEMBER_REHYDRATED
} from './rehydrate';

import init from './init';

const reduxRemember = (
    driver,
    {
        prefix = '@@persist-',
        loadedKey = 'storeLoaded',
        serialize,
        unserialize
    } = {}
) => {
    if (!driver) {
        throw Error('redux-remember error: driver required');
    }

    let persistableKeys = {};

    const combineReducers = (
        persistable = {},
        forgettable = {},
        ...extra
    ) => {
        const reducers = reduxCombineReducers(
            {
                ...persistable,
                ...forgettable,
                [loadedKey]: (state = false) => state
            },
            ...extra
        );

        persistableKeys = Object.keys(
            persistable
        );

        return rehydrateReducer(
            reducers,
            loadedKey
        );
    };

    const createStore = (reducer, preloadedStateOrEnhancer, ...extra) => {
        const hasPreloadedState = typeof preloadedStateOrEnhancer !== 'function';

        const rehydrate = hasPreloadedState
            ? reducer(preloadedStateOrEnhancer)
            : reducer();

        const store = hasPreloadedState
            ? reduxCreateStore(rehydrate, ...extra)
            : reduxCreateStore(rehydrate, preloadedStateOrEnhancer, ...extra);

        init(
            store,
            persistableKeys,
            { driver, prefix, serialize, unserialize }
        );

        return store;
    };

    return {
        combineReducers,
        createStore
    };
};

export { REMEMBER_REHYDRATED };
export default reduxRemember;
