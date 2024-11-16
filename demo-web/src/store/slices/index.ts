import persistedSlice from './persisted-slice';
import forgottenSlice from './forgotten-slice';
import reduxRememberSlice from './redux-remember-slice';

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
