export const REMEMBER_REHYDRATED = `@@REMEMBER_REHYDRATED`;

export const rehydrate = async (
    store,
    persistableKeys = [],
    { prefix, driver }
) => {
    let state = {};

    try {
        const items = await Promise.all(
            persistableKeys
            .map(key => driver.getItem(
                `${prefix}${key}`
            ))
        );

        state = persistableKeys
        .reduce((obj, key, i) => {
            if (items[i] !== null) {
                obj[key] = JSON.parse(items[i]);
            }

            return obj;
        }, {});
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

export const rehydrateReducer = (reducers, loadedKey) => (preloaded = {}) => {
    const data = {
        state: preloaded
    };

    return (state = data.state, action) => {
        switch (action.type) {
            case REMEMBER_REHYDRATED:
                data.state = reducers(
                    {
                        ...data.state,
                        ...(action.payload || {})
                    },
                    { type: REMEMBER_REHYDRATED }
                );

                data.state[loadedKey] = true;
                return data.state;

            default:
                return reducers(
                    state,
                    action
                );
        }
    }
};
