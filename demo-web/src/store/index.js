import reducers from './reducers';
import reduxRemember from 'redux-remember';

const { createStore, combineReducers } = reduxRemember(
    window.localStorage
);

const store = createStore(
    combineReducers(
        reducers.persistable,
        reducers.forgettable
    )
);

export default store;
