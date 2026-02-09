---
title: Usage Overview
---

This section contains comprehensive usage guides for using Redux Remember in various environments and scenarios.

## Platform-Specific Usage

Learn how to set up Redux Remember for your target platform:

- [Web Usage](./web-usage.md) - Using Redux Remember in web applications with localStorage or sessionStorage
- [React Native Usage](./react-native-usage.md) - Using Redux Remember in React Native with AsyncStorage

## Advanced Topics

Explore advanced features and patterns:

- [Migrations with Redux Remigrate](./migrations.md) - Handle migrations with auto-generated version types and CLI tooling using Redux Remigrate
- [Custom Storage Driver](./custom-storage-driver.md) - Create custom storage drivers for specialized use cases like secure storage or multiple storage types
- [Using in Reducers](./using-in-reducers.md) - Listen to Redux Remember actions in your reducers to track rehydration and persistence events
- [Rehydration Gate](./rehydration-gate.md) - Prevent rendering and show a loader until persisted state has been loaded
- [Error Handling](./error-handling.md) - Handle persistence and rehydration errors gracefully

## Getting Started

If you're new to Redux Remember, start with the [Quick Start Guide](../quick-start.md) for a basic introduction.

## Legacy Redux

If you're using plain Redux without Redux Toolkit, check out the [Legacy Usage](./legacy/index.md) guides.

## See Also

- [Quick Start](../quick-start.md) - Get started quickly with Redux Remember
- [API Reference](../api/index.md) - Complete API documentation
