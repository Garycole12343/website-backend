import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState =
  loadState("writingBoard") || {
    writingResources: [],
  };

const writingBoardSlice = createSlice({
  name: "writingBoard",
  initialState,
  reducers: {
    addWritingResource: (state, action) => {
      state.writingResources.push(action.payload);
    },
    updateWritingLike: (state, action) => {
      const item = state.writingResources.find(
        (r) => r.id === action.payload
      );
      if (item) item.likes += 1;
    },
  },
});

export const { addWritingResource, updateWritingLike } =
  writingBoardSlice.actions;

export default writingBoardSlice.reducer;
