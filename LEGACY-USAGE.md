# Legacy Usage (apps without redux toolkit)

Legacy usage - web
------------------

```js
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = (state = '', action) => {
  switch (action.type) {
    case 'SET_TEXT1':
      return action.payload;

    default:
      return state;
  }
};

const myStateIsForgotten = (state = '', action) => {
  switch (action.type) {
    case 'SET_TEXT2':
      return action.payload;

    default:
      return state;
  }
}

const reducers = {
  myStateIsRemembered,
  myStateIsForgotten
};

const rememberedKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const reducer = rememberReducer(
  combineReducers(reducers)
);

const store = createStore(
  reducer,
  compose(
    applyMiddleware(
      // ...
    ),
    rememberEnhancer(
      window.localStorage, // or window.sessionStorage, or your own custom storage driver
      rememberedKeys
    )
  )
);

// Continue using the redux store as usual...
```

Legacy usage - react native
---------------------------

```js
import AsyncStorage from '@react-native-community/async-storage';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { rememberReducer, rememberEnhancer } from 'redux-remember';

const myStateIsRemembered = (state = '', action) => {
  switch (action.type) {
    case 'SET_TEXT1':
      return action.payload;

    default:
      return state;
  }
};

const myStateIsForgotten = (state = '', action) => {
  switch (action.type) {
    case 'SET_TEXT2':
      return action.payload;

    default:
      return state;
  }
};

const reducers = {
  myStateIsRemembered,
  myStateIsForgotten
};

const rememberedKeys = [ 'myStateIsRemembered' ]; // 'myStateIsForgotten' will be forgotten, as it's not in this list

const reducer = rememberReducer(
  combineReducers(reducers)
);

const store = createStore(
  reducer,
  compose(
    applyMiddleware(
      // ...
    ),
    rememberEnhancer(
      AsyncStorage, // or your own custom storage driver
      rememberedKeys
    )
  )
);

// Continue using the redux store as usual...
```

Legacy usage - inside a reducer
-------------------------------

```js
import { SOME_ACTION } from './actions';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from 'redux-remember';

const defaultState = {
  changeMe: null,
  rehydrated: false,
  persisted: false
};

const changeMeReducer = (state = defaultState, action) => {
  switch (action.type) {
    case REMEMBER_REHYDRATED:
      // state gets rehydrated from storage
      // payload is Rehydrated Root State
      return {
        ...changeMe: action.payload.changeMeReducer?.changeMe || null,
        rehydrated: true
      };

    case REMEMBER_PERSISTED:
      return {
        ...state,
        rehydrated: false,
        persisted: true
      };

    case SOME_ACTION:
      // example: only merge payload from SOME_ACTION event types
      // after the state rehydration is done
      if (!state.rehydrated) {
        return state;
      }

      return {
        ...state,
        changeMe: action.payload
      };

    default:
      return state;
  }
}

export default changeMeReducer;
```
