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
  migrate?: (state: any) => any;
  persistThrottle?: number;
  persistDebounce?: number;
  persistWholeStore?: boolean;
  errorHandler?: (error: PersistError | RehydrateError | MigrateError) => void;
  initActionType?: string;
}
```

The `errorHandler` receives [`PersistError`](#persisterror), [`RehydrateError`](#rehydrateerror), or [`MigrateError`](#migrateerror) instances.

**See:** [`rememberEnhancer`](./remember-enhancer.md) for detailed descriptions of each option.

**Tip:** It is highly recommended that you use use [Redux Remigrate](../usage/migrations.md) for type-safe migrations with auto-generated version types and CLI tooling.

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

### MigrateError

```ts
class MigrateError extends Error {
  // Thrown when migration fails
}
```

**Thrown when:** The `migrate` function throws an error during state migration. When this occurs, the default store state (from reducer initial values) is used to prevent the app from crashing.

**Note:** Migration only runs if rehydration was successful. If rehydration fails, migration is skipped entirely.

**See:** [Error Handling Guide](../usage/error-handling.md) for complete examples of handling these errors.

## See Also

- [rememberEnhancer](./remember-enhancer.md) - API reference for using these types
- [Migrations with Redux Remigrate](../usage/migrations.md) - Use Redux Remigrate for migrations with auto-generated types and CLI tooling
