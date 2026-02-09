<img src="./packages/docs-website/src/assets/logo-remember.webp" alt="Redux Remember Logo" width="150"/>

**Redux Remember saves (persists) and loads (rehydrates) your Redux state from any key-value storage**

[![NPM Version](https://img.shields.io/npm/v/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)
[![Coverage Status](https://codecov.io/github/zewish/redux-remember/graph/badge.svg?token=69BRZBXR3R)](https://codecov.io/github/zewish/redux-remember)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)

[Documentation](https://redux-remember.js.org/) | [Live Demo](https://redux-remember.js.org/demo/) | [GitHub](https://github.com/zewish/redux-remember)

---

## Features

- **Selective persistence** - Save and load only the keys you specify
- **Multi-platform** - Works with React, React Native/Expo or any app that uses Redux
- **Supports different storage drivers** - localStorage, sessionStorage, AsyncStorage (React Native), or your own custom driver
- **Battle-tested** - Fully tested with Redux 5.0+ and Redux Toolkit 2.0+
- **TypeScript ready** - Fully type safe with TypeScript definitions included

## Installation

```bash
npm install redux-remember
# or
pnpm/yarn/bun add redux-remember
```

## Quick Start

```ts
import { configureStore } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { myStateIsRemembered, myStateIsForgotten } from './reducers';

const reducers = {
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer,
};

const rememberedKeys = ['myStateIsRemembered'] satisfies (keyof typeof reducers)[];

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(window.localStorage, rememberedKeys)
  )
});
```

See the [Quick Start guide](https://redux-remember.js.org/quick-start/) for complete setup instructions.

---

## State Migrations with Redux Remigrate

Need to migrate persisted state when your schema changes?<br />
[**Redux Remigrate**](./packages/redux-remigrate) is a companion library that provides TypeScript-first migrations for Redux Remember.

```bash
npm install redux-remigrate
```

### Remigrate: Modify your store the following way:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { myStateIsRemembered, myStateIsForgotten } from './reducers';
import { _remigrateVersion } from 'redux-remigrate';
import { migrate } from './remigrate';

const reducers = {
  // 1. Add the _remigrateVersion reducer to track your state version:
  _remigrateVersion,
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer,
};

const rememberedKeys = [
  // 2. Make sure _remigrateVersion gets persisted with the state:
  '_remigrateVersion'
  'myStateIsRemembered',
] satisfies (keyof typeof reducers)[];
const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    // 3. Pass the migrate function to the rememberEnhancer:
    rememberEnhancer(window.localStorage, rememberedKeys, {
      migrate
    })
  )
});

export type RootState = ReturnType<typeof store['getState']>;
// 4. Set your "stateTypeExpression" in config to the type name you specify here:
export type PersistedState = Pick<RootState, typeof rememberedKeys[number]>;
```

### Remigrate: Create a config file

Create `remigrate.config.ts` in your project root:

```ts
import { defineRemigrateConfig } from 'redux-remigrate';

export default defineRemigrateConfig({
  storagePath: './src/remigrate',
  stateFilePath: './src/store.ts',
  stateTypeExpression: 'PersistedState'
});
```

### Remigrate: available commands

```bash
npx remigrate init     # Initialize migrations directory
npx remigrate create   # Create a migration when state schema changes
npx remigrate validate # Validate migration types
```

See the [Redux Remigrate documentation](https://redux-remember.js.org/usage/migrations/) for setup and usage.

---

## Development

This is a monorepo managed with [Turborepo](https://turbo.build/repo):

| Package | Description |
|---------|-------------|
| `packages/redux-remember`  | The main library                |
| `packages/redux-remigrate` | State migration library         |
| `packages/remigrate`       | CLI wrapper for redux-remigrate |
| `packages/docs-website`    | Documentation site              |

```bash
npm install
npm run build     # Build all packages
npm run test      # Run tests
npm run typecheck # Run type checking
npm run lint      # Run linter
```

## License

MIT
