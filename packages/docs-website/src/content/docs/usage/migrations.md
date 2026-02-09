---
title: Migrations with Redux Remigrate
---

As your application evolves, your persisted state schema will change. Redux Remigrate is a TypeScript-first migration layer that provides type-safe, automatic state migrations management for Redux Remember.

## Why Use Migrations?

Without migrations, users with old persisted data may experience:
- Runtime errors when accessing renamed or removed fields
- Loss of data when state shape changes
- Broken application state after updates

Redux Remigrate solves this by:
- **TypeScript-first approach** - Auto-generated version types ensure type safety
- **Automatic version tracking** - Tracks schema versions and runs migrations sequentially
- **CLI tooling** - Generate migrations, validate types, and clean up unused files
- **Circular migration detection** - Built-in safeguards prevent infinite loops

## Installation

Install Redux Remigrate alongside Redux Remember:

```bash
npm install redux-remigrate
```

## Quick Setup

### 1. Create a config file

Create `remigrate.config.ts` in your project root:

```ts
import { defineRemigrateConfig } from 'redux-remigrate';

export default defineRemigrateConfig({
  storagePath: './src/remigrate',
  stateFilePath: './src/store.ts',
  stateTypeExpression: 'PersistedState',
});
```

See [Configuration Options](#configuration-options) for all available settings.

### 2. Initialize migrations directory

```bash
npx remigrate init
```

This creates the migrations directory structure and generates the initial version file based on your current store type.

### 3. Add to Redux Remember

Import the generated `migrate` function and pass it to Redux Remember:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { _remigrateVersion } from 'redux-remigrate';
import { migrate } from './remigrate/index.ts';

const reducers = {
  // 1. Add the _remigrateVersion reducer to track your state version:
  _remigrateVersion,
  myStateIsForgotten,
  myStateIsRemembered,
};

const rememberedKeys = [
  // 2. Make sure _remigrateVersion gets persisted with the state:
  '_remigrateVersion',
  'myStateIsRemembered',
] satisfies (keyof typeof reducers)[];

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(window.localStorage, rememberedKeys, {
      // 3. Pass the migrate function to Redux Remember:
      migrate
    })
  )
});

export type RootState = ReturnType<typeof store['getState']>;
// 4. Make sure to set config value of "stateTypeExpression" to "PersistedState"
export type PersistedState = Pick<RootState, typeof rememberedKeys[number]>;
```

## Creating Migrations

### When your persisted state changes

Whenever you modify the structure of your persisted state (add/remove/rename fields, change types), run:

```bash
npx remigrate create
```

This will:
1. Detect changes to your store type
2. Generate a new version file if your persisted state is changed
3. Create a new migration file with type-safe function signatures

### Implementing migration logic

Edit the generated migration file to transform data from the old version to the new:

```ts
import type { StoreVersion_20260101_120000 } from '../versions/20260101_120000.ts';
import type { StoreVersion_20260115_140000 } from '../versions/20260115_140000.ts';

export const from_20260101_120000 = (
  { myStateIsRemembered, ...store }: StoreVersion_20260101_120000
): StoreVersion_20260115_140000 => ({
  ...store,
  myStateIsRemembered: {
    ...myStateIsRemembered,
    newFieldAdded: 'default value'
  },
  _remigrateVersion: '20260115_140000',
});
```

### Validating migrations

Check your migrations for TypeScript errors:

```bash
npx remigrate validate
```

This ensures all migration functions have correct type signatures.

## CLI Reference

```
Usage: remigrate <command> [options]

Commands:
  init [suffix]        Initialize migrations directory
  create [suffix]      Create a new migration file if store type changed
  cleanup              Remove unreferenced version type files
  validate             Validate migrations for TypeScript errors

Options:
  -c, --config <file>  Override config file path
```

### init

Initializes the migrations directory structure. Run this once when setting up migrations.

```bash
npx remigrate init
```

The optional `[suffix]` argument adds a suffix to the generated version file name.

### create

Creates a new migration when your persisted state type changes.

```bash
npx remigrate create
```

If the type hasn't changed, the command will skip creation. The optional `[suffix]` argument adds a descriptive suffix to the generated version files.

### cleanup

Removes unreferenced version type files that are no longer used by any migration.

```bash
npx remigrate cleanup
```

### validate

Validates all migration files for TypeScript errors.

```bash
npx remigrate validate
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `storagePath`           | `string` | Yes | Directory where migrations will be stored |
| `stateFilePath`         | `string` | Yes | Path to the file containing your persisted state type |
| `stateTypeExpression`   | `string` | Yes | The TypeScript type expression for your persisted state |
| `prettierrcPath`        | `string` | No  | Path to your Prettier config file |
| `tsconfigPath`          | `string` | No  | Path to your TypeScript config file |
| `headers.versionFile`   | `string` | No  | Custom header for generated version files |
| `headers.migrationFile` | `string` | No  | Custom header for generated migration files |
| `headers.indexFile`     | `string` | No  | Custom header for the generated index file |

### Example with all options

```ts
import { defineRemigrateConfig } from 'redux-remigrate';

export default defineRemigrateConfig({
  storagePath: './src/remigrate',
  stateFilePath: './src/store.ts',
  stateTypeExpression: 'PersistedState',
  prettierrcPath: './.prettierrc',
  tsconfigPath: './tsconfig.json',
  headers: {
    versionFile: '/* eslint-disable */',
    migrationFile: '/* eslint-disable */',
    indexFile: '/* eslint-disable */',
  },
});
```

## Generated Files

After initialization, Redux Remigrate creates the following structure:

```
src/remigrate/
├── index.ts           # Exports the migrate function
├── versions/          # Version type snapshots
│   └── 20260101_120000.ts
└── migrations/        # Migration functions
```

Each time you run `npx remigrate create`, new files are added:

```
src/remigrate/
├── index.ts           # Updated with new version
├── versions/
│   ├── 20260101_120000.ts
│   └── 20260115_140000.ts   # New version snapshot
└── migrations/
    └── 20260115_140000.ts   # Migration from previous version
```

## Common Migration Patterns

### Adding a new field

```ts
export const from_20260101_120000 = (
  state: StoreVersion_20260101_120000
): StoreVersion_20260115_140000 => ({
  ...state,
  mySlice: {
    ...state.mySlice,
    newField: 'default value'
  },
  _remigrateVersion: '20260115_140000',
});
```

### Renaming a field

```ts
export const from_20260101_120000 = (
  { mySlice, ...state }: StoreVersion_20260101_120000
): StoreVersion_20260115_140000 => {
  const { oldFieldName, ...rest } = mySlice;
  return {
    ...state,
    mySlice: {
      ...rest,
      newFieldName: oldFieldName
    },
    _remigrateVersion: '20260115_140000',
  };
};
```

### Removing a field

```ts
export const from_20260101_120000 = (
  { mySlice, ...state }: StoreVersion_20260101_120000
): StoreVersion_20260115_140000 => {
  const { removedField, ...rest } = mySlice;
  return {
    ...state,
    mySlice: rest,
    _remigrateVersion: '20260115_140000',
  };
};
```

### Transforming data

```ts
export const from_20260101_120000 = (
  state: StoreVersion_20260101_120000
): StoreVersion_20260115_140000 => ({
  ...state,
  mySlice: {
    ...state.mySlice,
    tags: state.mySlice.tags
      ? state.mySlice.tags.split(',') // Convert existing string to an array
      : []
  },
  _remigrateVersion: '20260115_140000',
});
```

## Error Handling

If a migration throws an error, Redux Remember's [`errorHandler`](../api/remember-enhancer.md#errorhandler) will receive it as a [`MigrateError`](../api/types.md#migrateerror), and the default store state (from reducer initial values) is used to prevent the app from crashing. Always test your migrations thoroughly.

**Note:** Migration only runs after successful rehydration. If rehydration fails, migration is skipped entirely.

```ts
import { migrate } from './remigrate/index.ts';
import { MigrateError } from 'redux-remember';

rememberEnhancer(window.localStorage, rememberedKeys, {
  migrate,
  errorHandler: (error) => {
    if (error instanceof MigrateError) {
      console.error('Migration failed:', error);
      // Default store state will be used - consider notifying the user
    }
  }
})
```

## See Also

- [rememberEnhancer - migrate option](../api/remember-enhancer.md#migrate) - API reference for the migrate option
- [Error Handling](./error-handling.md) - Handling persistence and migration errors
- [Web Usage](./web-usage.md) - Complete web setup example
- [React Native Usage](./react-native-usage.md) - Complete React Native setup example
