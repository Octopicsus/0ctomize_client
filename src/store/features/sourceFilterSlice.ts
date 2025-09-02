import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SourceFilter = 'all' | 'bank' | 'manual';

type State = {
  source: SourceFilter;
}

const initialState: State = {
  source: 'all'
};

const sourceFilterSlice = createSlice({
  name: 'sourceFilter',
  initialState,
  reducers: {
    setSourceFilter(state, action: PayloadAction<SourceFilter>) {
      state.source = action.payload;
    },
  }
});

export const { setSourceFilter } = sourceFilterSlice.actions;
export default sourceFilterSlice.reducer;
