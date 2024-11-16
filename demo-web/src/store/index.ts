import { configureStore } from '@reduxjs/toolkit';
import { reducers, actions } from './slices';
import { rememberReducer, rememberEnhancer } from 'redux-remember';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const rememberedKeys: Array<keyof typeof reducers> = [ 'persisted' ];

const store = configureStore({
  reducer: rememberReducer(reducers),
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(
    rememberEnhancer(
      window.localStorage,
      rememberedKeys,
      {
        persistWholeStore: true
      }
    )
  )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { actions };
export default store;
