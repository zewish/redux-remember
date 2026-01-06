---
title: API Reference Overview
---

Complete API documentation for Redux Remember.

## Core Functions

Redux Remember provides two main functions for setting up state persistence:

- [rememberReducer](./remember-reducer.md) - Wraps your reducers to enable state persistence
- [rememberEnhancer](./remember-enhancer.md) - A Redux enhancer that handles automatic state persistence and rehydration

## Actions

Redux Remember dispatches actions that you can listen to in your reducers:

- [Action Types](./actions.md) - `REMEMBER_REHYDRATED` and `REMEMBER_PERSISTED` action types

## Types Reference

Full TypeScript type definitions:

- [Types](./types.md) - `Driver`, `Options`, error types, and more

## See Also

For usage examples and guides, see [Usage guides](../usage/index.md).
