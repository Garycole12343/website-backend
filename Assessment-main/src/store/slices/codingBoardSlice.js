// src/store/slices/codingBoardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("codingBoard") || { codingResources: [] };

const codingBoardSlice = createSlice({
  name: "codingBoard",
  initialState,
  reducers: {
    addCodingResource: (state, action) => {
      state.codingResources.push(action.payload);
    },
    updateCodingLike: (state, action) => {
      const item = state.codingResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addCodingResource, updateCodingLike } = codingBoardSlice.actions;
export default codingBoardSlice.reducer;
