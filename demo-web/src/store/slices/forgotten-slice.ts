import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const forgottenTextSlice = createSlice({
  name: 'forgotten-text',
  initialState: {
    text: ''
  },
  reducers: {
    setForgottenText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

export default forgottenTextSlice;
