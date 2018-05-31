import isEqual from 'lodash.isequal';

export const persist = async (
    state = {},
    oldState = {},
    { prefix, driver }
) => {
    try {
        await Promise.all(
            Object.keys(state)
            .map(key => {
                if (isEqual(state[key], oldState[key])) {
                    return Promise.resolve();
                }

                return driver.setItem(
                    `${prefix}${key}`,
                    JSON.stringify(state[key])
                );
            })
        );
    }
    catch (err) {
        console.warn(
            'redux-remember: persist error',
            err
        );
    }
};
