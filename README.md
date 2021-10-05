[![NPM Version](https://img.shields.io/npm/v/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)
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
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

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

const rememberedKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const store = createStore(
    rememberReducer(
        combineReducers(reducers)
    ),
    compose(
        applyMiddleware(
            // ...
        ),
        rememberEnhancer(
            window.localStorage, // or window.sessionStorage, or your own custom storage driver
            rememberedKeys
        )
    )
);

// Continue using the redux store as usual...
```

Usage - react native
--------------------

```js
import AsyncStorage from '@react-native-community/async-storage';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

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

const rememberedKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const store = createStore(
    rememberReducer(
        combineReducers(reducers)
    ),
    compose(
        applyMiddleware(
            // ...
        ),
        rememberEnhancer(
            AsyncStorage, // or your own custom storage driver
            rememberedKeys
        )
    )
);

// Continue using the redux store as usual...
```

Usage - inside a reducer
------------------------

```js
import { SOME_ACTION } from './actions';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from 'redux-remember';

const defaultState = {
    changeMe: null,
    rehydrated: false,
    persisted: false
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

        case REMEMBER_PERSISTED:
            return {
                ...state,
                rehydrated: false,
                persisted: true
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
- **rememberReducer(rootReducer: Reducer)**
    - Arguments:
        1. **rootReducer** *(required)* - takes the result of `combineReducers()` function;
    - Returns - a new root reducer to use as first argument for the `createStore()` function;


- **rememberEnhancer(driver: Driver, rememberedKeys: string[], options?: Options)**
    - Arguments:
        1. **driver** *(required)* - storage driver instance, that implements the `setItem(key, value)` and `getItem(key)` functions;
        2. **rememberedKeys** *(required)* - an array of persistable keys - if an empty array is provided nothing will get persisted;
        3. **options** *(optional)* - plain object of extra options:
            - **prefix**: storage key prefix *(default: `'@@remember-'`)*;
            - **serialize** - a plain function that takes unserialized store state and its key (`serialize(state, keyStr)`) and returns serialized state to be persisted *(default: `JSON.stringify`)*;
            - **unserialize** - a plain function that takes serialized persisted state  and its key (`serialize(serializedStr, keyStr)`) and returns unserialized to be set in the store *(default: `JSON.parse`)*;
            - **persistThrottle** - how much time should the persistence be throttled in milliseconds *(default: `100`)*
            - **persistWholeStore** - a boolean which specifies if the whole store should be persisted at once. Generally only use this if you're using your own storage driver which has gigabytes of storage limits. Don't use this when using window.localStorage, window.sessionStorage or AsyncStorage as their limits are quite small. When using this option, key won't be passed to `serialize` nor `unserialize` functions - *(default: `false`)*;
    - Returns - an enhancer to be used with Redux
