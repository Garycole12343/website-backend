// src/store/slices/photographySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("photographyBoard") || { photographyResources: [] };

const photographySlice = createSlice({
  name: "photographyBoard",
  initialState,
  reducers: {
    addPhotographyResource: (state, action) => {
      state.photographyResources.push(action.payload);
    },
    updatePhotographyLike: (state, action) => {
      const item = state.photographyResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addPhotographyResource, updatePhotographyLike } = photographySlice.actions;
export default photographySlice.reducer;
