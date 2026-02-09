---
title: Quick Start
---

This guide will help you install and get started with Redux Remember in a web application using Redux Toolkit.

## When to Use Redux Remember

Use Redux Remember when you need to:
- Persist user preferences (theme, language, UI state) across sessions
- Maintain authentication state through page refreshes
- Save form data to prevent data loss on accidental navigation
- Cache API responses in localStorage for offline support

## Installation

Install Redux Remember:

```bash
npm install --save redux-remember
```

## Basic Setup

Here's a minimal example to get you started:

```ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = createSlice({
  name: 'persisted-slice',
  initialState: {
    text: ''
  },
  reducers: {
    setPersistedText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const myStateIsForgotten = createSlice({
  name: 'forgotten-slice',
  initialState: {
    text: ''
  },
  reducers: {
    setForgottenText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const reducers = {
  myStateIsRemembered: myStateIsRemembered.reducer,
  myStateIsForgotten: myStateIsForgotten.reducer,
  someExtraData: (state = 'bla') => state
};

export const actions = {
  ...myStateIsRemembered.actions,
  ...myStateIsForgotten.actions
};

const rememberedKeys: (keyof typeof reducers)[] = ['myStateIsRemembered']; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage, // or window.sessionStorage, or your own custom storage driver
      rememberedKeys
    )
  )
});

// Continue using the redux store as usual...
```

## Key Concepts

1. **[rememberReducer](./api/remember-reducer.md)**: Wraps your reducers to enable state persistence
2. **[rememberEnhancer](./api/remember-enhancer.md)**: A Redux enhancer that handles the actual persistence logic
3. **rememberedKeys**: An array of keys specifying what should be persisted

## Next Steps

- [Usage guides](./usage/index.md) - Platform-specific guides and advanced features
- [Migrations](./usage/migrations.md) - Use Redux Remigrate for migrations with auto-generated types and CLI tooling
- [API Reference](./api/index.md) - Complete API documentation
