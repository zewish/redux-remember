import {
    createStore as reduxCreateStore,
    combineReducers as reduxCombineReducers
} from 'redux';

import { rehydrateReducer } from './rehydrate';
import init from './init';

const reduxRemember = (
    driver,
    persistableKeys,
    {
        prefix = '@@remember-',
        persistThrottle = 100,
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
            reducers,
            ...extra
        );

        return rehydrateReducer(
            rootReducer
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
            { driver, prefix, serialize, unserialize, persistThrottle }
        );

        return store;
    };

    return {
        combineReducers,
        createStore
    };
};

export * from './action-types';
export default reduxRemember;
