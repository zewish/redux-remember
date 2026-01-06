---
title: rememberEnhancer
---

A Redux enhancer that handles automatic state persistence and rehydration.

## Signature

```ts
rememberEnhancer(
  driver: Driver,
  rememberedKeys: string[],
  options?: Options
): StoreEnhancer
```

See [Driver](./types.md#driver) and [Options](./types.md#options) type definitions.

## Parameters

### 1. driver *(required)*

- Type: [`Driver`](./types.md#driver)
- Description: Storage driver instance that implements `setItem(key, value)` and `getItem(key)`

**Built-in Options:**
- `window.localStorage` - Persistent storage (web)
- `window.sessionStorage` - Session storage (web)
- `AsyncStorage` - Async storage (React Native)
- Custom driver - Any object implementing the Driver interface

**Driver Interface:**
```ts
interface Driver {
  setItem(key: string, value: any): void | Promise<void>;
  getItem(key: string): any | Promise<any>;
}
```

### 2. rememberedKeys *(required)*

- Type: `string[]`
- Description: Array of state keys to persist
- Note: If an empty array is provided, nothing will be persisted

### 3. options *(optional)*

- Type: [`Options`](./types.md#options)
- Description: Configuration object for customizing behavior

**Options Interface:** (see [Options](./types.md#options))
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

## Options Details

### prefix

- **Type:** `string`
- **Default:** `'@@remember-'`
- **Description:** Prefix for storage keys

### serialize

- **Type:** `(state: any, key: string) => string`
- **Default:** `JSON.stringify`
- **Description:** Function to serialize state before persisting

### unserialize

- **Type:** `(state: string, key: string) => any`
- **Default:** `JSON.parse`
- **Description:** Function to deserialize persisted state

### persistThrottle

- **Type:** `number` (milliseconds)
- **Default:** `100`
- **Description:** Throttle persistence to limit write frequency
- **Note:** Ignored if `persistDebounce` is provided
- **Best for:** Most apps/websites, guarantees your store is persisted on regular intervals

### persistDebounce

- **Type:** `number` (milliseconds)
- **Default:** `undefined`
- **Description:** Debounce persistence (trailing-edge only)
- **Note:** If provided, `persistThrottle` is ignored
- **Best for:** Apps/websites where you can guarantee there is some time between store writes and you could tollerate some data loss

**Example:**
```ts
// Debounce for form input
rememberEnhancer(window.localStorage, rememberedKeys, {
  persistDebounce: 500 // Wait 500ms after user stops typing
})

// Throttle for real-time updates
rememberEnhancer(window.localStorage, rememberedKeys, {
  persistThrottle: 200 // Save at most once every 200ms
})
```

### persistWholeStore

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether to persist the entire store as a single item
- **Storage Limits:**
  - `localStorage`: ~5-10MB (varies by browser)
  - `sessionStorage`: ~5-10MB (varies by browser)
  - `AsyncStorage`: ~6MB on Android, larger on iOS
- **Warnings:**
  - Only use with storage drivers that have large enough limits for your use-case
  - When persisting large states, consider using individual key persistence (default behavior) to avoid quota errors
  - Always implement error handling to catch quota exceeded errors
- **Note:** When `true`, the `key` parameter is not passed to `serialize`/`unserialize` functions

### errorHandler

- **Type:** `(error: `[`PersistError`](./types.md#persisterror)` | `[`RehydrateError`](./types.md#rehydrateerror)`) => void`
- **Default:** `console.warn`
- **Description:** Hook function to handle persistence and rehydration errors
- **Note:** Error objects include full stack traces
- **See:** [Error Handling Guide](../usage/error-handling.md) for complete examples

### initActionType

- **Type:** `string`
- **Default:** `undefined`
- **Description:** Action type to wait for before initializing
- **Use Case:** When you need to do something before state rehydration (e.g., SSR preloading)
- **Note:** Redux Remember will be completely disabled until an action with this type is dispatched

## Returns

- Type: `StoreEnhancer`
- Description: A Redux enhancer to be used with your store

## See Also

- [rememberReducer](./remember-reducer.md) - Wrap your reducers
- [Types](./types.md) - TypeScript type definitions
- [Quick Start](../quick-start.md)
- [Error Handling](../usage/error-handling.md)
- [Custom Storage Driver](../usage/custom-storage-driver.md)
