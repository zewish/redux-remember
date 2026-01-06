---
title: TypeScript Types
---

Redux Remember exports the following TypeScript types for better type safety in your application.

## Driver

Storage driver interface for implementing custom storage solutions.

```ts
interface Driver {
  setItem(key: string, value: any): void | Promise<void>;
  getItem(key: string): any | Promise<any>;
}
```

**See:** [Custom Storage Driver](../usage/custom-storage-driver.md) for complete implementation examples.

## Options

Configuration options for [`rememberEnhancer`](./remember-enhancer.md).

```ts
interface Options {
  prefix?: string;
  serialize?: (state: any, key: string) => string;
  unserialize?: (state: string, key: string) => any;
  persistThrottle?: number;
  persistDebounce?: number;
  persistWholeStore?: boolean;
  errorHandler?: (error: PersistError | RehydrateError) => void;
  initActionType?: string;
}
```

The `errorHandler` receives [`PersistError`](#persisterror) or [`RehydrateError`](#rehydrateerror) instances.

**See:** [`rememberEnhancer`](./remember-enhancer.md) for detailed descriptions of each option.

## Error Types

### PersistError

```ts
class PersistError extends Error {
  // Thrown when persistence fails
}
```

**Thrown when:** State cannot be saved to storage (e.g., quota exceeded, storage unavailable).

### RehydrateError

```ts
class RehydrateError extends Error {
  // Thrown when rehydration fails
}
```

**Thrown when:** State cannot be loaded from storage (e.g., corrupted data, parsing errors).

**See:** [Error Handling Guide](../usage/error-handling.md) for complete examples of handling these errors.

## See Also

- [rememberEnhancer](./remember-enhancer.md) - API reference for using these types
