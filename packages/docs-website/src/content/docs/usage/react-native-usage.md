---
title: React Native Usage
---

This guide shows how to use Redux Remember in React Native applications with AsyncStorage or similar.

## Complete Example

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

const rememberedKeys: (keyof typeof reducers)[] = ['myStateIsRemembered']; // 'myStateIsForgotten' will be forgotten, as it's not in this list

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

## Using Custom Storage Driver

For more advanced use cases where you need to use custom storage driver (e.g., AsyncStorage for regular data and SecureStore for sensitive data), see the [Custom Storage Driver](./custom-storage-driver.md) guide.

## See Also

- [Web Usage](./web-usage.md)
- [Custom Storage Driver](./custom-storage-driver.md)
- [Using in Reducers](./using-in-reducers.md)
- [Legacy React Native Usage](./legacy/react-native.md)
