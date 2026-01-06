import { createAction, createSlice } from '@reduxjs/toolkit';
import { REMEMBER_PERSISTED, REMEMBER_REHYDRATED } from 'redux-remember';

const reduxRememberSlice = createSlice({
  name: 'redux-remember',
  initialState: {
    isRehydrated: false,
    rehydratedDate: '',
    isPersisted: false,
    persistedDate: ''
  },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(createAction(REMEMBER_REHYDRATED), (state) => {
      state.isRehydrated = true;
      state.rehydratedDate = new Date().toLocaleString(window.navigator.language);
    })
    .addCase(createAction(REMEMBER_PERSISTED), (state) => {
      state.isPersisted = true;
      state.persistedDate = new Date().toLocaleString(window.navigator.language);
    })
});

export default reduxRememberSlice;
