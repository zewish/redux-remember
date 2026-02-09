<img src="https://raw.githubusercontent.com/zewish/redux-remember/master/packages/docs-website/src/assets/logo-remigrate.webp" alt="Redux Remigrate Logo" width="150" />

**Redux Remigrate is a TypeScript-first migration layer for Redux Remember**

[![NPM Version](https://img.shields.io/npm/v/redux-remigrate.svg?style=flat-square)](https://www.npmjs.com/package/redux-remigrate)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)
[![Coverage Status](https://codecov.io/github/zewish/redux-remember/graph/badge.svg?token=69BRZBXR3R)](https://codecov.io/github/zewish/redux-remember)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-remigrate.svg?style=flat-square)](https://www.npmjs.com/package/redux-remigrate)

[Documentation](https://redux-remember.js.org/) | [GitHub](https://github.com/zewish/redux-remember/tree/master/packages/redux-remigrate)

---

## Features

- **TypeScript first** - Migrator only works with TypeScript and uses auto-generated version types
- **CLI tooling** - Generate migrations, validate types, and clean up unused files
- **Automatic version tracking** - Tracks store schema versions and runs migrations sequentially
- **Prettier integration** - Generated files respect your project's Prettier config (if available)
- **Circular migration detection** - Prevents infinite loops with built-in safeguards

## Installation

```bash
npm install redux-remigrate
# or
pnpm/yarn/bun add redux-remigrate
```

## Quick Start

### 1. Create a config file

Create `remigrate.config.ts` in your project root:

```ts
import { defineRemigrateConfig } from 'redux-remigrate';

export default defineRemigrateConfig({
  storagePath: './src/remigrate',
  stateFilePath: './src/store.ts',
  stateTypeExpression: 'PersistedState',
  // prettierrcPath: './.prettierrc',
  // tsconfigPath: './tsconfig.json',
});
```

This creates the migrations directory structure and generates the initial version file based on your current store type.

### 2. Add to Redux Remember

Import the generated `migrate` function and pass it to Redux Remember:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { _remigrateVersion } from 'redux-remigrate';
import { myStateIsRemembered, myStateIsForgotten } from './reducers.ts';
import { migrate } from './remigrate/index.ts';

const reducers = {
  // 3.1. Add the _remigrateVersion reducer to track your state version:
  _remigrateVersion,
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer,
};

const rememberedKeys = [
  // 3.2. Make sure _remigrateVersion gets persisted with the state:
  '_remigrateVersion',
  'myStateIsRemembered',
] satisfies (keyof typeof reducers)[];

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    // 3.3. Pass the migrate function to the rememberEnhancer:
    rememberEnhancer(window.localStorage, rememberedKeys, {
      migrate
    })
  )
});

export type RootState = ReturnType<typeof store['getState']>;
// 3.4. Set your "stateTypeExpression" to the type name you specify here:
export type PersistedState = Pick<RootState, typeof rememberedKeys[number]>;
```

### 3. Initialize migrations directory

```bash
npx remigrate init
```

### 4. Create a migration when your persisted state changes

When your persisted state type changes, run:

```bash
npx remigrate create
```

This will:
- Detect changes to your store type
- Generate a new version file with the updated type
- Create a migration file with type-safe function signatures

### 5. Implement state migration logic in your newly created migrations file

Edit the generated migration file to transform data from the old version to the new:

```ts
import type { StoreVersion_20240101_120000 } from '../versions/20240101_120000.ts';
import type { StoreVersion_20240115_140000 } from '../versions/20240115_140000.ts';

export const from_20240101_120000 = (
  { myStateIsRemembered, ...store }: StoreVersion_20240101_120000
): StoreVersion_20240115_140000 => ({
  ...store,
  myStateIsRemembered: {
    ...myStateIsRemembered,
    newFieldAdded: 'yay!'
  },
  _remigrateVersion: '20240115_140000',
});
```

### 6. Validate migration types

Run the validate command to check your migrations for TypeScript errors:

```bash
npx remigrate validate
```

This ensures all migration functions correspond to their type signatures.

## CLI Commands

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

## Configuration Options

| Option | Type | Required | Description |
|-------------------------|----------|-----|------------------------------------------ |
| `storagePath`           | `string` | Yes | Directory where migrations will be stored |
| `stateFilePath`         | `string` | Yes | Path to the file containing your persisted state type |
| `stateTypeExpression`   | `string` | Yes | The TypeScript type expression for your persisted state |
| `prettierrcPath`        | `string` | No  | Path to your Prettier config file |
| `tsconfigPath`          | `string` | No  | Path to your TypeScript config file |
| `headers.versionFile`   | `string` | No  | Custom header for generated version files |
| `headers.migrationFile` | `string` | No  | Custom header for generated migration files |
| `headers.indexFile`     | `string` | No  | Custom header for the generated index file |

For more examples and detailed API documentation, visit the [full documentation](https://redux-remember.js.org/migrations/).

## License

MIT
