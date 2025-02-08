[![NPM Version](https://img.shields.io/npm/v/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/zewish/redux-remember/badge.svg?branch=master)](https://coveralls.io/github/zewish/redux-remember?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)

![Logo](https://raw.githubusercontent.com/zewish/redux-remember/master/logo.png)

Redux Remember saves and loads your redux state from a key-value store of your choice.

__Important__

The current version of Redux Remember is tested working with redux@5.0.0+ and redux-toolkit@2.0.1+.<br />
In case you want to use this library with an older versions of Redux or Redux Toolkit you might need to switch back to version 4.2.2 of Redux Remember.

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

Usage - react-native with multiple storage types 
------------------------------------------------

**Custom Driver that uses both expo-secure-store and AsyncStorage**

```ts
import { configureStore } from '@reduxjs/toolkit';
import { Driver, rememberReducer, rememberEnhancer } from 'redux-remember';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducers from './reducers';

const secureKeys = ['secureKey1', 'secureKey2'];
const rememberedKeys = [
  'insecureKey1', 'insecureKey2',
  ...secureKeys
];

export const customDriver: Driver = {
  setItem(key: string, value: any) {
    if (secureKeys.includes(originalKey)) { // If using prefix use: secureKeys.includes(key.slice(prefix.length))
      return SecureStore.setItemAsync(key, value);
    }

    return AsyncStorage.setItem(key, value);
  },
  getItem(key: string) {
    if (secureKeys.includes(key)) { // If using prefix use: secureKeys.includes(key.slice(prefix.length))
      return SecureStore.getItemAsync(key);
    }

    return AsyncStorage.getItem(key);
  }
};

const store = configureStore({
  reducer: rememberReducer(reducers),
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      customDriver,
      rememberedKeys,
      { prefix: '' }
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

const initialState = {
  isRehydrated: false,
  isPersisted: false
};

const reduxRemember = createSlice({
  name: 'redux-remember',
  initialState,
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(createAction(REMEMBER_REHYDRATED), (state, action) => {
      // "action.payload" is the Rehydrated Root State
      state.isRehydrated = true;
    })
    .addCase(createAction(REMEMBER_PERSISTED), (state, action) => {
      state.isPersisted = true;
    })
});

const reducers = {
  reduxRemember: reduxRemember.reducer,
  // ...
};

const rememberedKeys = [ 'myStateIsRemembered' ];
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

export type RootState = ReturnType<typeof store.getState>;
export default store;

// Continue using the redux store as usual...
```

Usage - React rehydration gate
------------------------------

**Prerequisite: to be used with: [Usage - inside a reducer](#usage---inside-a-reducer) or similar**

```tsx
import { FC, PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import ReactDOM from 'react-dom/client';
import store, { RootState } from './store';

const RehydrateGate: FC<PropsWithChildren> = ({ children }) => {
  const isRehydrated = useSelector<RootState>((state) => state.reduxRemember.isRehyrdated);
  return isRehydrated
    ? children
    : <div>Rehydrating, please wait...</div>;
};

const root = ReactDOM.createRoot(
  document.getElementById('root')!
);

root.render(
  <Provider store={store}>
    <RehydrateGate>
      <App />
    </RehydrateGate>
  </Provider>
);
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
            - **errorHandler** - an error handler hook function which is gets a first argument of type `PersistError` or `RehydrateError` - these include a full error stack trace pointing to the source of the error. If this option isn't specified the default behaviour is to log the error using console.warn() - *(default: `console.warn`)*;
            - **initActionType** (optional) - a string which allows you to postpone the initialization of `Redux Remember` until an action with this type is dispatched to the store. This is used in special cases whenever you want to do something before state gets rehydrated and persisted automatically (e.g. preload your state from SSR). **NOTE: With this option enabled Redux Remember will be completely disabled until `dispatch({ type: YOUR_INIT_ACTION_TYPE_STRING })` is called**;
    - Returns - an enhancer to be used with Redux
