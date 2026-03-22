// src/store/slices/cookingBoardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("cookingBoard") || { cookingResources: [] };

const cookingBoardSlice = createSlice({
  name: "cookingBoard",
  initialState,
  reducers: {
    addCookingResource: (state, action) => {
      state.cookingResources.push(action.payload);
    },
    updateCookingLike: (state, action) => {
      const item = state.cookingResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addCookingResource, updateCookingLike } = cookingBoardSlice.actions;
export default cookingBoardSlice.reducer;
