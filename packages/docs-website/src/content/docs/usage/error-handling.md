---
title: Error Handling
---

Redux Remember provides robust error handling for persistence, rehydration, and migration operations. This guide shows you how to handle errors gracefully in your application.

## Error Types

Redux Remember exports three error types:

- [`PersistError`](../api/types.md#persisterror) - Thrown when saving state to storage fails
- [`RehydrateError`](../api/types.md#rehydrateerror) - Thrown when loading state from storage fails
- [`MigrateError`](../api/types.md#migrateerror) - Thrown when state migration fails

## Basic Error Handler

The [`errorHandler`](../api/remember-enhancer.md#errorhandler) option in [`rememberEnhancer`](../api/remember-enhancer.md) lets you handle errors from persistence, rehydration, and migration:

```ts
import reducers from './reducers';
import { configureStore } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer, PersistError, RehydrateError, MigrateError } from 'redux-remember';

const rememberedKeys: (keyof typeof reducers)[] = ['user', 'settings'];
const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage,
      rememberedKeys,
      {
        errorHandler: (error) => {
          if (error instanceof PersistError) {
            console.error('Failed to save state:', error);
            // Handle persistence errors
          } else if (error instanceof RehydrateError) {
            console.error('Failed to load state:', error);
            // Handle rehydration errors
          } else if (error instanceof MigrateError) {
            console.error('Failed to migrate state:', error);
            // Handle migration errors
          }
        }
      }
    )
  )
});
```

## Logging to Error Tracking Service

Send errors to your monitoring service:

```ts
import reducers from './reducers';
import * as Sentry from '@sentry/browser';
import { configureStore } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const rememberedKeys: (keyof typeof reducers)[] = ['user', 'settings'];
const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage,
      rememberedKeys,
      {
        errorHandler: (error) => {
          // Log to Sentry or similar service
          Sentry.captureException(error);
        }
      }
    )
  )
});
```

## Default Error Handler

If you don't provide an `errorHandler`, Redux Remember uses `console.warn` by default. This means errors won't crash your app but will be logged to the console.

## See Also

- [Types - Error Types](../api/types.md#error-types) - PersistError, RehydrateError, and MigrateError definitions
- [rememberEnhancer - errorHandler](../api/remember-enhancer.md#errorhandler) - API reference
- [Migrations with Redux Remigrate](./migrations.md) - Type-safe state migrations
- [Custom Storage Driver](./custom-storage-driver.md)
