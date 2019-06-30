import { rehydrate } from './rehydrate';
import { persist } from './persist';
import throttle from 'lodash.throttle';
import pick from 'lodash.pick';
import isEqual from 'lodash.isequal';
import { REMEMBER_PERSISTED } from './action-types';

const init = async (
    store,
    rememberedKeys,
    {
        prefix,
        driver,
        serialize,
        unserialize,
        persistThrottle = 100,
        persistWholeStore = false
    }
) => {
    await rehydrate(
        store,
        rememberedKeys,
        { prefix, driver, unserialize, persistWholeStore }
    );

    let oldState = {};

    store.subscribe(throttle(async () => {
        const state = pick(
            store.getState(),
            rememberedKeys
        );

        await persist(
            state,
            oldState,
            { prefix, driver, serialize, persistWholeStore }
        );

        if (!isEqual(state, oldState)) {
            store.dispatch({
                type: REMEMBER_PERSISTED,
                payload: state
            });
        }

        oldState = state;
    }, persistThrottle));
};

export default init;
