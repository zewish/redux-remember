[![NPM Version](https://img.shields.io/npm/v/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)
[![Build Status](https://api.travis-ci.org/zewish/redux-remember.svg?branch=master)](https://travis-ci.org/zewish/redux-remember)
[![Coverage Status](https://coveralls.io/repos/github/zewish/redux-remember/badge.svg?branch=master)](https://coveralls.io/github/zewish/redux-remember?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)

![Logo](https://raw.githubusercontent.com/zewish/redux-remember/master/logo.png)

Redux Remember saves and loads your redux state from a key-value store of your choice.

__Key features:__
- Saves (persists) and loads (rehydrates) only allowed keys and does not touch anything else.
- Completely unit and battle tested.
- Works on both web (any redux compatible app) and native (react-native).

__Works with any of the following:__
- AsyncStorage (react-native)
- LocalStorage (web)
- SessionStorage (web)
- Your own custom storage driver that implements `setItem(key, value)` and `getItem(key)`

### [__See demo!__](https://rawgit.com/zewish/redux-remember/master/demo-web/index.html)

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

const myStateIsRemembered = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT1':
            return payload;

        default:
            return state;
    }
};

const myStateIsForgotten = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT2':
            return payload;

        default:
            return state;
    }
}

const reducers = {
    myStateIsRemembered,
    myStateIsForgotten
};

const persistableKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const { createStore, combineReducers } = reduxRemember(
    window.localStorage, // or window.sessionStorage, or your own custom storage driver
    persistableKeys
);

const store = createStore(
    combineReducers(reducers),
    applyMiddleware(
        // ...
    )
);

// Continue using the redux store as usual...
```

Usage - react native
--------------------

```js
import AsyncStorage from '@react-native-community/async-storage';
import { applyMiddleware } from 'redux';
import reduxRemember from './redux-remember';

const myStateIsRemembered = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT1':
            return payload;

        default:
            return state;
    }
};

const myStateIsForgotten = (state = '', { type, payload }) => {
    switch (type) {
        case 'SET_TEXT2':
            return payload;

        default:
            return state;
    }
};

const reducers = {
    myStateIsRemembered,
    myStateIsForgotten
};

const persistableKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const { createStore, combineReducers } = reduxRemember(
    AsyncStorage,  // or your own custom storage driver
    persistableKeys
);

const store = createStore(
    combineReducers(reducers),
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
            };

        case SOME_ACTION:
            // example: only merge payload from SOME_ACTION event types
            // after the state rehydration is done
            if (!state.rehydrated) {
                return state;
            }

            return {
                ...state,
                changeMe: payload
            };

        default:
            return state;
    }
};
```

API reference
-------------
- reduxRemember(driver, persistableKeys, options)
    - Arguments:
        1. driver - storage driver instance, that implements the `setItem(key, value)` and `getItem(key)` functions;
        2. persistableKeys - an array of persistable keys - if an empty array is provided nothing will get persisted;
        3. options - plain object of extra options:
            - prefix: storage key prefix *(default: '@@remember-')*;
            - serialize - a plain function that takes unserialized store state and returns serialized state to be persisted *(default: `JSON.stringify()`)*;
            - unserialize - a plain function that takes serialized persisted state and returns unserialized to be set in the store *(default: `JSON.parse()`)*;
            - persistThrottle - how much time should the persistence be throttled in milliseconds *(default: 100)*
            - persistWholeStore - a boolean which specifies if the whole store should be persisted at once. Generally only use this if you're using your own storage driver which has gigabytes of storage limits. Don't use this when using window.localStorage, window.sessionStorage or AsyncStorage as their limits are quite small - *(default: `false`)*;
    - Returns - plain object with 2 patched redux functions:
        1. createStore() - uses exactly the same API as the default `react-redux` function;
        2. combineReducers(reducers) - uses exactly the same API as the default `react-redux` function;
