---
title: Using in Reducers
---

Redux Remember dispatches actions when state is rehydrated from storage and when it's persisted. You can listen to these actions in your reducers to update your application state accordingly.

## Action Types

Redux Remember exports two action types:

- [`REMEMBER_REHYDRATED`](../api/actions.md#remember_rehydrated) - Dispatched when state has been loaded from storage
- [`REMEMBER_PERSISTED`](../api/actions.md#remember_persisted) - Dispatched when state has been saved to storage

## Complete Example

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
      console.log('Rehydrated state:', action.payload); // "action.payload" is the partial rehydrated state (only remembered keys)
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

const rememberedKeys = ['myStateIsRemembered'] satisfies (keyof typeof reducers)[];
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

## Action Payloads

### REMEMBER_REHYDRATED

When the [`REMEMBER_REHYDRATED`](../api/actions.md#remember_rehydrated) action is dispatched:
- `action.payload` contains the complete rehydrated root state
- This happens once when the application loads
- You can use this to perform any post-rehydration logic

### REMEMBER_PERSISTED

When the [`REMEMBER_PERSISTED`](../api/actions.md#remember_persisted) action is dispatched:
- This happens after state has been successfully saved to storage
- Useful for showing persistence status indicators or debugging

## Use Cases

- **Loading States**: Show a loading spinner until `isRehydrated` is true
- **Analytics**: Track when persistence occurs
- **Debugging**: Log rehydration events during development
- **UI Feedback**: Show users when their data has been saved
- **Gating**: Prevent certain actions until state is rehydrated (see [Rehydration Gate](./rehydration-gate.md))

## See Also

- [Action Types](../api/actions.md) - API reference
- [Rehydration Gate](./rehydration-gate.md)
- [Legacy Reducer Usage](./legacy/reducers.md)
