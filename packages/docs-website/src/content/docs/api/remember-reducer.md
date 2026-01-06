---
title: rememberReducer
---

Wraps your reducers to enable state persistence.

## Signature

```ts
rememberReducer(reducers: Reducer | ReducersMapObject): Reducer
```

## Parameters

- **reducers** *(required)*
  - Type: `Reducer | ReducersMapObject`
  - Description: Either the result of `combineReducers()` or a map of reducers (which will be combined internally, similar to Redux Toolkit's `configureStore`)

## Returns

- Type: `Reducer`
- Description: A new root reducer to use with `configureStore()` (Redux Toolkit) or `createStore()` (plain Redux)

## See Also

- [rememberEnhancer](./remember-enhancer.md) - Configure persistence behavior
- [Quick Start](../quick-start.md)
- [Web Usage](../usage/web-usage.md)
