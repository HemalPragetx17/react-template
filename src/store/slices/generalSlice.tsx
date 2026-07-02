import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IGeneralState } from '../state/app-state';

const initialState: IGeneralState = {
  tableLoading: false,
  formLoading: false,
  progressLoading: false,
};

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    handleTableLoader: (state, action: PayloadAction<boolean>) => {
      state.tableLoading = action.payload;
    },
    handleFormLoader: (state, action: PayloadAction<boolean>) => {
      state.formLoading = action.payload;
    },
    handleProgressLoader: (state, action: PayloadAction<boolean>) => {
      state.progressLoading = action.payload;
    },
  },
});

export const { handleTableLoader, handleFormLoader, handleProgressLoader } = generalSlice.actions;
export default generalSlice.reducer;
