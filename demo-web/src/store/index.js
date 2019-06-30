import { createStore, combineReducers, compose } from 'redux';
import reducers from './reducers';
// import reduxRemember from './redux-remember';

const rememberReducer = ReduxRemember.rememberReducer;
const rememberEnhancer =  ReduxRemember.rememberEnhancer;

const persistableKeys = [ 'textToBePersisted' ];

// DEV TOOLS
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rememberReducer(
        combineReducers(reducers)
    ),
    { someData: 'asdf' },
    compose(
        rememberEnhancer(
            window.localStorage,
            persistableKeys
        ),
        window.__REDUX_DEVTOOLS_EXTENSION__()
    )
);

export default store;
