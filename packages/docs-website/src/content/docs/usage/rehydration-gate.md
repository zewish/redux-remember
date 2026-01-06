---
title: Rehydration Gate
---

A rehydration gate is a React component that prevents your app from rendering until the persisted state has been loaded. This ensures your UI doesn't flash with default/empty state before the saved data loads.

## Prerequisites

This pattern requires tracking the rehydration status in your reducers. See [Using in Reducers](./using-in-reducers.md) for the setup.

## Implementation

```tsx
import { FC, PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import store, { RootState } from './store';
import ReactDOM from 'react-dom/client';
import Provider from 'react-redux';

const RehydrateGate: FC<PropsWithChildren> = ({ children }) => {
  const isRehydrated = useSelector<RootState>((state) => state.reduxRemember.isRehydrated);
  return isRehydrated
    ? children
    : <div>Rehydrating, please wait...</div>;
};

const root = ReactDOM.createRoot(
  document.getElementById('root')!
);

root.render(
  <Provider store={store}>
    <RehydrateGate>
      <App />
    </RehydrateGate>
  </Provider>
);
```

## How It Works

1. The `RehydrateGate` component checks if the state has been rehydrated
2. If not rehydrated, it shows a loading message (or spinner, or splash screen)
3. Once `isRehydrated` becomes `true`, it renders the children (your app)
4. This prevents the UI from flickering with default state values

## Customization

You can customize the loading UI to match your application:

```tsx
const RehydrateGate: FC<PropsWithChildren> = ({ children }) => {
  const isRehydrated = useSelector<RootState>((state) => state.reduxRemember.isRehydrated);

  if (!isRehydrated) {
    return (
      <div className="loading-screen">
        <Spinner />
        <p>Loading your data...</p>
      </div>
    );
  }

  return <>{children}</>;
};
```

## When to Use

Use a rehydration gate when:
- You're persisting critical UI state (user preferences, authentication, etc.)
- You want to avoid showing default values before persisted data loads
- The user experience should be consistent on reload

Skip the gate when:
- Persistence is only for non-critical data
- You're okay with showing default values briefly
- You have other loading states handling the initial render

## See Also

- [Using in Reducers](./using-in-reducers.md) - Required prerequisite
- [`REMEMBER_REHYDRATED`](../api/actions.md#remember_rehydrated) - Action dispatched when state is rehydrated
