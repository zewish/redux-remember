---
title: Legacy Web Usage
---

This guide shows how to use Redux Remember with plain Redux (without Redux Toolkit) in web applications.

## Complete Example

```ts
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
}

const reducers = {
  myStateIsRemembered,
  myStateIsForgotten
};

const rememberedKeys = ['myStateIsRemembered'] satisfies (keyof typeof reducers)[]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

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
      window.localStorage, // or window.sessionStorage, or your own custom storage driver
      rememberedKeys
    )
  )
);

// Continue using the redux store as usual...
```

## Storage Options

Just like the modern approach, you can use:
- `window.localStorage` - Persists across sessions
- `window.sessionStorage` - Persists only for the current session
- Custom storage driver - See [Custom Storage Driver](../custom-storage-driver.md)

## See Also

- [Web Usage](../web-usage.md) - Modern Redux Toolkit approach
- [Legacy React Native Usage](./react-native.md)
- [Legacy Reducer Usage](./reducers.md)
