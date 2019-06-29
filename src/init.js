import { rehydrate } from './rehydrate';
import { persist } from './persist';
import pick from 'lodash.pick';

const init = async (
    store,
    persistableKeys,
    { prefix, driver, serialize, unserialize }
) => {
    await rehydrate(
        store,
        persistableKeys,
        { prefix, driver, unserialize }
    );

    let oldState = {};

    store.subscribe(async () => {
        const state = pick(
            store.getState(),
            persistableKeys
        );

        await persist(
            state,
            oldState,
            { prefix, driver, serialize }
        );

        oldState = state;
    });
};

export default init;
