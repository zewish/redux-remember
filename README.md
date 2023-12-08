[![NPM Version](https://img.shields.io/npm/v/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/zewish/redux-remember/badge.svg?branch=master)](https://coveralls.io/github/zewish/redux-remember?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)

![Logo](https://raw.githubusercontent.com/zewish/redux-remember/master/logo.png)

Redux Remember saves and loads your redux state from a key-value store of your choice.

__Important__

The current version of Redux Remember is tested with redux@5.0.0+ and redux-toolkit@2.0.1+.<br />
In case you are using TypeScript and want to use Redux Remember with an older versions of Redux you might need to switch back to version 4.2.2 of Redux Remember.

__Key features:__
- Saves (persists) and loads (rehydrates) only allowed keys and does not touch anything else.
- Completely unit and battle tested.
- Works on both web (any redux compatible app) and native (react-native).

__Works with any of the following:__
- AsyncStorage (react-native)
- LocalStorage (web)
- SessionStorage (web)
- Your own custom storage driver that implements `setItem(key, value)` and `getItem(key)`

### [__See demo!__](https://zewish.github.io/redux-remember/demo-web/)

Installation
------------
```bash
$ npm install --save redux-remember
# or
$ yarn add redux-remember
```

Usage - web
-----------

```ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = createSlice({
  name: 'persisted-slice',
  initialState: {
    text: ''
  },
  reducers: {
    setPersistedText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const myStateIsForgotten = createSlice({
  name: 'forgotten-slice',
  initialState: {
    text: ''
  },
  reducers: {
    setForgottenText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const reducers = {
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer,
  someExtraData: (state = 'bla') => state
};

export const actions = {
  ...myStateIsRemembered.actions,
  ...myStateIsForgotten.actions
};

const rememberedKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage, // or window.sessionStorage, or your own custom storage driver
      rememberedKeys
    )
  )
});

// Continue using the redux store as usual...
```

Usage - react-native
--------------------

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = createSlice({
  name: 'persisted-slice',
  initialState: {
    text: ''
  },
  reducers: {
    setPersistedText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const myStateIsForgotten = createSlice({
  name: 'forgotten-slice',
  initialState: {
    text: ''
  },
  reducers: {
    setForgottenText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const reducers = {
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer,
  someExtraData: (state = 'bla') => state
};

export const actions = {
  ...myStateIsRemembered.actions,
  ...myStateIsForgotten.actions
};

const rememberedKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers:  (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      AsyncStorage, // or your own custom storage driver
      rememberedKeys
    )
  )
});

// Continue using the redux store as usual...
```

Usage - inside a reducer
------------------------

```ts
import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from 'redux-remember';

type InitialState = {
  changeMe: any;
  rehydrated: boolean;
  persisted: boolean;
};

const initialState: InitialState = {
  changeMe: null,
  rehydrated: false,
  persisted: false
};

const myReducer = createSlice({
  name: 'my-reducer',
  initialState,
  reducers: {
    someAction(state, action: PayloadAction<{ changeMe: any }>) {
      if (!state.rehydrated) {
        return;
      }

      state.changeMe = action.payload.changeMe;
    }
  },
  extraReducers: (builder) => builder
    .addCase(createAction<{ myReducer?: InitialState }>(REMEMBER_REHYDRATED), (state, action) => {
      // @INFO: action.payload.myReducer => rehydrated state of this reducer or "undefined" during the first run
      state.changeMe = action.payload.myReducer?.changeMe || null;
      state.rehydrated = true;
    })
    .addCase(createAction<{ myReducer?: InitialState }>(REMEMBER_PERSISTED), (state, action) => {
      // @INFO: action.payload.myReducer => persisted state of this reducer or "undefined" in case this reducer is not persisted
      state.rehydrated = false;
      state.persisted = true;
    })
});

const reducers = {
  myReducer: myReducer.reducer,
  // ...
};

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage, // or window.sessionStorage, or AsyncStorage, or your own custom storage driver
      rememberedKeys
    )
  )
});

// Continue using the redux store as usual...
```

Usage - legacy apps (without redux toolkit)
-------------------------------------------

Examples here are using redux toolkit.<br>
If your application still isn't migrated to redux toolkit, [check the legacy usage documentation](./LEGACY-USAGE.md).


API reference
-------------
- **rememberReducer(reducers: Reducer | ReducersMapObject)**
    - Arguments:
        1. **reducers** *(required)* - takes the result of `combineReducers()` function or list of non-combined reducers to combine internally (same as redux toolkit);
    - Returns - a new root reducer to use as first argument for the `configureStore()` (redux toolkit) or the `createStore()` (plain redux) function;


- **rememberEnhancer(driver: Driver, rememberedKeys: string[], options?: Options)**
    - Arguments:
        1. **driver** *(required)* - storage driver instance, that implements the `setItem(key, value)` and `getItem(key)` functions;
        2. **rememberedKeys** *(required)* - an array of persistable keys - if an empty array is provided nothing will get persisted;
        3. **options** *(optional)* - plain object of extra options:
            - **prefix**: storage key prefix *(default: `'@@remember-'`)*;
            - **serialize** - a plain function that takes unserialized store state and its key (`serialize(state, stateKey)`) and returns serialized state to be persisted *(default: `JSON.stringify`)*;
            - **unserialize** - a plain function that takes serialized persisted state  and its key (`serialize(state, stateKey)`) and returns unserialized to be set in the store *(default: `JSON.parse`)*;
            - **persistThrottle** - how much time should the persistence be throttled in milliseconds *(default: `100`)*
            - **persistDebounce** *(optional)* - how much time should the persistence be debounced by in milliseconds. If provided, persistence will not be throttled, and the `persistThrottle` option will be ignored. The debounce is a simple trailing-edge-only debounce.
            - **persistWholeStore** - a boolean which specifies if the whole store should be persisted at once. Generally only use this if you're using your own storage driver which has gigabytes of storage limits. Don't use this when using window.localStorage, window.sessionStorage or AsyncStorage as their limits are quite small. When using this option, key won't be passed to `serialize` nor `unserialize` functions - *(default: `false`)*;
            - **initActionType** (optional) - a string which allows you to postpone the initialization of `Redux Remember` until an action with this type is dispatched to the store. This is used in special cases whenever you want to do something before state gets rehydrated and persisted automatically (e.g. preload your state from SSR). **NOTE: With this option enabled Redux Remember will be completely disabled until `dispatch({ type: YOUR_INIT_ACTION_TYPE_STRING })` is called**;
    - Returns - an enhancer to be used with Redux
