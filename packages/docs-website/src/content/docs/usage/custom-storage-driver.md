---
title: Custom Storage Driver
---

Redux Remember supports custom storage drivers, allowing you to use any storage solution or combine multiple storage types.

## Driver Interface

A storage driver must implement two methods (see [`Driver`](../api/types.md#driver) type):

```ts
interface Driver {
  setItem(key: string, value: any): void | Promise<void>;
  getItem(key: string): any | Promise<any>;
}
```

## Example: Multiple Storage Types (React Native)

This example shows how to create a custom driver that uses both `expo-secure-store` for sensitive data and `AsyncStorage` for regular data:

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
    if (secureKeys.includes(key)) { // If using prefix use: secureKeys.includes(key.slice(prefix.length))
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

## See Also

- [Types - Driver](../api/types.md#driver) - Driver interface type definition
- [rememberEnhancer](../api/remember-enhancer.md) - Using the driver parameter
- [Error Handling](./error-handling.md) - Handling storage errors
