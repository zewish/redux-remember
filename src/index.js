import init from './init';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from './action-types';

const REDUX_INIT = '@@INIT';

const rememberReducer = (reducers) => {
    const data = {
        state: {}
    };

    return (state = data.state, action = {}) => {
        switch (action.type) {
            case REDUX_INIT:
                data.state = { ...state };

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

const rememberEnhancer = (
    driver,
    rememberedKeys,
    {
        prefix = '@@remember-',
        serialize,
        unserialize,
        persistThrottle,
        persistWholeStore
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
            { driver, prefix, serialize, unserialize, persistThrottle, persistWholeStore }
        );

        return store;
    };
};

export {
    rememberReducer,
    rememberEnhancer,
    REMEMBER_REHYDRATED,
    REMEMBER_PERSISTED
};
