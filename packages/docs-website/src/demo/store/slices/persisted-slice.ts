import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const persistedTextSlice = createSlice({
  name: 'persisted-text',
  initialState: {
    text: ''
  },
  reducers: {
    setPersistedText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

export default persistedTextSlice;
