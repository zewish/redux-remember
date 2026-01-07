<img src="./packages/docs-website/src/assets/logo.webp" alt="Redux Remember Logo" width="150"/>

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
import reducers from './reducers';

const rememberedKeys: (keyof typeof reducers)[] = ['keyToPersist'];

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

## Development

This is a monorepo managed with [Turborepo](https://turbo.build/repo):

| Package | Description |
|---------|-------------|
| `packages/redux-remember` | The main library   |
| `packages/docs-website`   | Documentation site |

```bash
npm install
npm run build     # Build all packages
npm run test      # Run tests
npm run typecheck # Run type checking
npm run lint      # Run linter
```

## License

MIT
