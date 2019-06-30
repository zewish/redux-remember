import isEqual from 'lodash.isequal';

export const saveAll = (
    state,
    oldState,
    { prefix, driver, serialize }
) => {
    if (!isEqual(state, oldState)) {
        return driver.setItem(
            `${prefix}state@@`,
            serialize(state)
        );
    }
};

export const saveAllKeyed = (
    state,
    oldState,
    { prefix, driver, serialize }
) => Promise.all(
    Object.keys(state)
    .map(key => {
        if (isEqual(state[key], oldState[key])) {
            return Promise.resolve();
        }

        return driver.setItem(
            `${prefix}${key}`,
            serialize(state[key])
        );
    })
);

export const persist = async (state = {}, oldState = {}, {
    prefix,
    driver,
    persistWholeStore,
    serialize = (obj) => JSON.stringify(obj)
}) => {
    try {
        const save = persistWholeStore
            ? saveAll
            : saveAllKeyed;

        await save(
            state,
            oldState,
            { prefix, driver, serialize }
        );
    }
    catch (err) {
        console.warn(
            'redux-remember: persist error',
            err
        );
    }
};
