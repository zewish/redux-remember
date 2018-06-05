![Logo](https://raw.githubusercontent.com/zewish/redux-remember/master/logo.png)

Redux Remember saves and loads your redux state from a key-value store of your choice

__Works with any of the following:__
- AsyncStorage (react-native)
- LocalStorage (web)
- SessionStorage (web)
- Your own custom storage driver that implements `setItem(key, value)` and `getItem(key)`

__Status:__
- Considered mostly stable (manually tested for now), used in production environment apps.
- Still missing proper test coverage and advanced documentation.

[__See demo!__](https://rawgit.com/zewish/redux-remember/master/demo-web/index.html)

Installation
------------
```bash
$ npm install --save redux-remember
# or
$ yarn add redux-remember
```


Usage - web
-----------

```js
import { applyMiddleware } from 'redux';
import reduxRemember from 'redux-remember';

const remembered = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT1':
            return payload;

        default:
            return state;
    }
};

const forgotten = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT2':
            return payload;

        default:
            return state;
    }
}

const reducers = {
    persistable: {
        myStateIsRemembered: remembered
    },
    forgettable: {
        myStateIsForgotten: forgotten
    }
};

const { createStore, combineReducers } = reduxRemember(
    window.localStorage // or window.sessionStorage, or your own custom storage
);

const store = createStore(
    combineReducers(
        reducers.persistable,
        reducers.forgettable
    ),
    applyMiddleware(
        // ...
    )
);

// Continue using the redux store as usual...
```

Usage - react native
--------------------

```js
import { AsyncStorage } from 'react-native';
import { applyMiddleware } from 'redux';
import reduxRemember from './redux-remember';

const remembered = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT1':
            return payload;

        default:
            return state;
    }
};

const forgotten = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT2':
            return payload;

        default:
            return state;
    }
}

const reducers = {
    persistable: {
        myStateIsRemembered: remembered
    },
    forgettable: {
        myStateIsForgotten: forgotten
    }
};

const { createStore, combineReducers } = reduxRemember(
    AsyncStorage  // or your own custom storage
);

const store = createStore(
    combineReducers(
        reducers.persistable,
        reducers.forgettable
    ),
    applyMiddleware(
        // ...
    )
);

// Continue using the redux store as usual...
```

Usage - inside a reducer
------------------------

```js
import { SOME_ACTION } from './actions';
import { REMEMBER_REHYDRATED } from 'redux-remember';

const defaultState = {
    changeMe: null,
    rehydrated: false
};

export default (state = defaultState, { type, payload }) => {
    switch (type) {
        case REMEMBER_REHYDRATED:
            // state gets rehydrated from storage
            // state == { changeMe: 123 }
            return {
                ...state,
                rehydrated: true
            }

        case SOME_ACTION:
            return {
                ...state,
                changeMe: payload
            }

        default:
            return state;
    }
};
```

API reference
-------------
- reduxRemember(driver, options)
    - Arguments:
        1. driver - storage driver instance, that implements the `setItem(key, value)` and `getItem(key)` functions;
        2. options - plain object of extra options:
            - prefix: storage key prefix *(default: '@@persist-')*;
            - loadedKey: store loaded reducer key *(default: 'storeLoaded')*;
    - Returns - plain object with 2 patched redux functions:
        1. createStore() - uses exactly the same API as the default redux function;
        2. combineReducers(persistableReducers, nonPersistableReducers) - has a slight API change from the default redux function, and instead of 1 argument takes 2 arguments:
            - persistableReducers: a plain object - list of reducers which are allowed to be saved and loaded from the storage;
            - nonPersistableReducers: a plain object - list of reducers which aren't allowed to be saved and loaded from the storage;
