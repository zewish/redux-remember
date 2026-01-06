---
title: Legacy React Native Usage
---

This guide shows how to use Redux Remember with plain Redux (without Redux Toolkit) in React Native applications.

## Complete Example

```js
import AsyncStorage from '@react-native-community/async-storage';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = (state = '', action) => {
  switch (action.type) {
    case 'SET_TEXT1':
      return action.payload;

    default:
      return state;
  }
};

const myStateIsForgotten = (state = '', action) => {
  switch (action.type) {
    case 'SET_TEXT2':
      return action.payload;

    default:
      return state;
  }
};

const reducers = {
  myStateIsRemembered,
  myStateIsForgotten
};

const rememberedKeys: (keyof typeof reducers)[] = ['myStateIsRemembered']; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const reducer = rememberReducer(
  combineReducers(reducers)
);

const store = createStore(
  reducer,
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

## See Also

- [React Native Usage](../react-native-usage.md) - Modern Redux Toolkit approach
- [Legacy Web Usage](./web.md)
- [Legacy Reducer Usage](./reducers.md)
- [Custom Storage Driver](../custom-storage-driver.md)
