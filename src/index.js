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
    persistableKeys,
    {
        prefix = '@@remember-',
        rehydratedKey = '__rehydrated__',
        serialize,
        unserialize
    } = {}
) => {
    if (!driver) {
        throw Error('redux-remember error: driver required');
    }

    if (!Array.isArray(persistableKeys)) {
        throw Error('redux-remember error: persistableKeys needs to be an array');
    }

    const combineReducers = (
        reducers = {},
        ...extra
    ) => {
        const rootReducer = reduxCombineReducers(
            {
                ...reducers,
                [rehydratedKey]: (state = false) => state
            },
            ...extra
        );

        return rehydrateReducer(
            rootReducer,
            rehydratedKey
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
