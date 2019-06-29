import isEqual from 'lodash.isequal';

export const persist = async (state = {}, oldState = {}, {
    prefix,
    driver,
    serialize = (obj) => JSON.stringify(obj)
}) => {
    try {
        await Promise.all(
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
    }
    catch (err) {
        console.warn(
            'redux-remember: persist error',
            err
        );
    }
};
