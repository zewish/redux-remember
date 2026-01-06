import persistedSlice from './persisted-slice.ts';
import forgottenSlice from './forgotten-slice.ts';
import reduxRememberSlice from './redux-remember-slice.ts';

export const reducers = {
  persisted: persistedSlice.reducer,
  forgotten: forgottenSlice.reducer,
  reduxRemember: reduxRememberSlice.reducer
};

export const actions = {
  ...persistedSlice.actions,
  ...forgottenSlice.actions,
  ...reduxRememberSlice.actions,
};
