import { rehydrateReducer } from './rehydrate';
import init from './init';

const rememberEnhancer = (
    driver,
    rememberedKeys,
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

    if (!Array.isArray(rememberedKeys)) {
        throw Error('redux-remember error: rememberedKeys needs to be an array');
    }

    return (createStore) => (rootReducer, initialState, enhancer) => {
        const store = createStore(
            rootReducer,
            initialState,
            enhancer
        );

        init(
            store,
            rememberedKeys,
            { driver, prefix, serialize, unserialize, persistThrottle }
        );

        return store;
    };
};

export * from './action-types';

export {
    rehydrateReducer as rememberReducer,
    rememberEnhancer
};
