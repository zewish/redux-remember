---
title: Web Usage
---

This guide shows how to use Redux Remember in web applications with Redux Toolkit.

## Complete Example

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

const rememberedKeys: (keyof typeof reducers)[] = ['myStateIsRemembered']; // 'myStateIsForgotten' will be forgotten, as it's not in this list

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

## Storage Options

Redux Remember supports multiple web storage options:

### LocalStorage

Persists data across browser sessions (survives page reloads and browser restarts):

```ts
rememberEnhancer(
  window.localStorage,
  rememberedKeys
)
```

### SessionStorage

Persists data only for the current browser session (cleared when tab/window is closed):

```ts
rememberEnhancer(
  window.sessionStorage,
  rememberedKeys
)
```

### Custom Storage Driver

You can also provide your own storage driver. See the [Custom Storage Driver](./custom-storage-driver.md) guide for more details.

## See Also

- [React Native Usage](./react-native-usage.md)
- [Custom Storage Driver](./custom-storage-driver.md)
- [Using in Reducers](./using-in-reducers.md)
- [Legacy Web Usage](./legacy/web.md)
