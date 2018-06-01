import {
    createStore as reduxCreateStore,
    combineReducers as reduxCombineReducers
} from 'redux';

import { rehydrateReducer } from './rehydrate';
import init from './init';

const reduxRemember = (
    driver,
    { prefix = '@@persist-', loadedKey = 'storeLoaded' } = {}
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

    const createStore = (reducer, preloadedState, ...extra) => {
        const store = reduxCreateStore(
            reducer(preloadedState),
            ...extra
        );

        init(
            store,
            persistableKeys,
            { driver, prefix }
        );

        return store;
    };

    return {
        combineReducers,
        createStore
    };
};

export default reduxRemember;
