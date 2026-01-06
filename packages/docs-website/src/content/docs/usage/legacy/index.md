---
title: Legacy Usage Overview
---

This section contains documentation for using Redux Remember with plain Redux (without Redux Toolkit).

## When to Use This Guide

The examples in the main documentation use Redux Toolkit, which is the recommended approach for Redux applications. However, if your application:

- Still uses plain Redux with `createStore` and `combineReducers`
- Hasn't migrated to Redux Toolkit yet
- Needs to maintain compatibility with older Redux patterns

...then these legacy usage guides are for you.

## Migration Recommendation

We strongly recommend migrating to Redux Toolkit for better developer experience, smaller bundle sizes, and improved patterns. However, Redux Remember continues to fully support legacy Redux applications.

## Legacy Guides

- [Web Usage](./web.md) - Using Redux Remember with plain Redux on web
- [React Native Usage](./react-native.md) - Using Redux Remember with plain Redux in React Native
- [Using in Reducers](./reducers.md) - Listening to Redux Remember actions in plain reducers

## Modern Approach

If you're starting a new project or able to migrate, check out the [Quick Start Guide](../../quick-start.md) for the modern Redux Toolkit approach.

## See Also

- [Quick Start](../../quick-start.md) - Modern Redux Toolkit approach
- [Web Usage](../web-usage.md) - Modern web usage with Redux Toolkit
- [React Native Usage](../react-native-usage.md) - Modern React Native usage with Redux Toolkit
- [API Reference](../../api/index.md) - Complete API documentation
