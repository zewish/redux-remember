<img src="https://raw.githubusercontent.com/zewish/redux-remember/master/packages/docs-website/src/assets/logo-remember.webp" alt="Redux Remember Logo" width="150" />

**Redux Remember saves (persists) and loads (rehydrates) your Redux state from any key-value storage**

[![NPM Version](https://img.shields.io/npm/v/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)
[![Coverage Status](https://codecov.io/github/zewish/redux-remember/graph/badge.svg?token=69BRZBXR3R)](https://codecov.io/github/zewish/redux-remember)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-remember.svg?style=flat-square)](https://www.npmjs.com/package/redux-remember)

[Documentation](https://redux-remember.js.org/) | [Live Demo](https://redux-remember.js.org/demo/) | [GitHub](https://github.com/zewish/redux-remember/tree/master/packages/redux-remember)

---

## Features

- **Selective persistence** - Save and load only the keys you specify
- **Multi-platform** - Works with React, React Native/Expo or any app that uses Redux
- **Supports different storage drivers** - localStorage, sessionStorage, AsyncStorage (React Native), or your own custom driver
- **Battle-tested** - Fully tested with Redux 5.0+ and Redux Toolkit 2.0+
- **TypeScript ready** - Fully type safe with TypeScript definitions included

> **Note:** For older versions of Redux or Redux Toolkit, use redux-remember@4.2.2

## Installation

```bash
npm install redux-remember
# or
pnpm/yarn/bun add redux-remember
```

## Quick Start

```ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = createSlice({
  name: 'persisted-slice',
  initialState: { text: '' },
  reducers: {
    setPersistedText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const myStateIsForgotten = createSlice({
  name: 'forgotten-slice',
  initialState: { text: '' },
  reducers: {
    setForgottenText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const reducers = {
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer
};

// Only 'myStateIsRemembered' will be persisted
const rememberedKeys: (keyof typeof reducers)[] = ['myStateIsRemembered'];
const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(window.localStorage, rememberedKeys)
  )
});
```

For more examples and detailed API documentation, visit the [full documentation](https://redux-remember.js.org/quick-start/).

## License

MIT
