import { rehydrate } from './rehydrate';
import { persist } from './persist';
import pick from 'lodash.pick';
import { REMEMBER_PERSISTED } from './action-types';

const init = async (
    store,
    persistableKeys,
    { prefix, driver, serialize, unserialize, persistWholeStore = false }
) => {
    await rehydrate(
        store,
        persistableKeys,
        { prefix, driver, unserialize, persistWholeStore }
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
            { prefix, driver, serialize, persistWholeStore }
        );

        store.dispatch({
            type: REMEMBER_PERSISTED,
            payload: state
        });

        oldState = state;
    });
};

export default init;
