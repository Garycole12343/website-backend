// src/store/slices/designBoardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("designBoard") || { designResources: [] };

const designBoardSlice = createSlice({
  name: "designBoard",
  initialState,
  reducers: {
    addDesignResource: (state, action) => {
      state.designResources.push(action.payload);
    },
    updateDesignLike: (state, action) => {
      const item = state.designResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addDesignResource, updateDesignLike } = designBoardSlice.actions;
export default designBoardSlice.reducer;
