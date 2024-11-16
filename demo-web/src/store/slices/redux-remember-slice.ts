import { createAction, createSlice } from '@reduxjs/toolkit';
import { REMEMBER_REHYDRATED } from 'redux-remember';

const reduxRememberSlice = createSlice({
  name: 'redux-remember',
  initialState: {
    isRehyrdated: false
  },
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(createAction(REMEMBER_REHYDRATED), (state) => {
      state.isRehyrdated = true;
    })
});

export default reduxRememberSlice;
