import { configureStore } from '@reduxjs/toolkit';
import reducers from './reducers';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const rememberedKeys = [ 'textToBePersisted' ];

const reducer = rememberReducer(reducers);
const store = configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage,
      rememberedKeys,
      {
        prefix: '@@rememebered-',
        persistWholeStore: true
      }
    )
  )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
