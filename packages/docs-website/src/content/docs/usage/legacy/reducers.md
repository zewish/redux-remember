---
title: Legacy Reducer Usage
---

This guide shows how to listen to Redux Remember actions in plain Redux reducers (without Redux Toolkit).

## Action Types

Redux Remember exports two action types:

- [`REMEMBER_REHYDRATED`](../../api/actions.md#remember_rehydrated) - Dispatched when state has been loaded from storage
- [`REMEMBER_PERSISTED`](../../api/actions.md#remember_persisted) - Dispatched when state has been saved to storage

## Complete Example

```js
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from 'redux-remember';

const defaultState = {
  isRehydrated: false,
  isPersisted: false
};

const reduxRemember = (state = defaultState, action) => {
  switch (action.type) {
    case REMEMBER_REHYDRATED:
      // "action.payload" is the Rehydrated Root State
      return {
        ...state,
        isRehydrated: true
      };

    case REMEMBER_PERSISTED:
      return {
        ...state,
        isPersisted: true
      };

    default:
      return state;
  }
}

export default reduxRemember;
```

## Using in Your Store

Include the reducer in your store setup:

```js
import { createStore, combineReducers, compose } from 'redux';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import reduxRemember from './reducers/reduxRemember';

const reducers = combineReducers({
  reduxRemember,
  // ... other reducers
});

const rememberedKeys = ['myStateIsRemembered'];

const store = createStore(
  rememberReducer(reducers),
  compose(
    rememberEnhancer(
      window.localStorage,
      rememberedKeys
    )
  )
);
```

## Action Payloads

### [`REMEMBER_REHYDRATED`](../../api/actions.md#remember_rehydrated)

- `action.payload` contains the complete rehydrated root state
- Dispatched once when the application loads
- Use this to set a flag that state is ready

### [`REMEMBER_PERSISTED`](../../api/actions.md#remember_persisted)

- Dispatched after state has been successfully saved
- Useful for showing status indicators

## Use Cases

- Track when state is ready for use
- Implement loading screens (see Rehydration Gate pattern)
- Debug persistence events
- Show save status to users

## See Also

- [Using in Reducers](../using-in-reducers.md) - Modern Redux Toolkit approach
- [Action Types](../../api/actions.md) - API reference
- [Rehydration Gate](../rehydration-gate.md)
