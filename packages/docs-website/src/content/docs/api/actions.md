---
title: Action Types
---

Redux Remember dispatches these actions that you can listen to in your reducers.

## REMEMBER_REHYDRATED

- **Type:** `'@@REMEMBER_REHYDRATED'`
- **Description:** Dispatched when state has been loaded from storage
- **Payload:** The complete rehydrated root state
- **Timing:** Dispatched once when the application loads

## REMEMBER_PERSISTED

- **Type:** `'@@REMEMBER_PERSISTED'`
- **Description:** Dispatched when state has been saved to storage
- **Payload:** None
- **Timing:** Dispatched after state has been successfully saved to storage

## See Also

- [Using in Reducers](../usage/using-in-reducers.md)
- [Legacy Reducer Usage](../usage/legacy/reducers.md)
