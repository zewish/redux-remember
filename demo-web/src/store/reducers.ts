import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const textToBePersisted = createSlice({
  name: 'set-persisted-text',
  initialState: {
    text: ''
  },
  reducers: {
    setPersistedText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const textToBeForgotten = createSlice({
  name: 'set-forgotten-text',
  initialState: {
    text: ''
  },
  reducers: {
    setForgottenText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    }
  }
});

const reducers = {
  textToBePersisted: textToBePersisted.reducer,
  textToBeForgotten: textToBeForgotten.reducer,
  someExtraData: (state = 'bla') => state
};

export const actions = {
  ...textToBePersisted.actions,
  ...textToBeForgotten.actions
};

export default reducers;
