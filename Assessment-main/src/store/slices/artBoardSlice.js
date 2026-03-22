// src/store/slices/artBoardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("artBoard") || { artResources: [] };

const artBoardSlice = createSlice({
  name: "artBoard",
  initialState,
  reducers: {
    addArtResource: (state, action) => {
      state.artResources.push(action.payload);
    },
    updateArtLike: (state, action) => {
      const item = state.artResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addArtResource, updateArtLike } = artBoardSlice.actions;
export default artBoardSlice.reducer;
