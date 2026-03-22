// src/store/slices/reactBoardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("reactBoard") || {
  reactResources: [],
};

const reactBoardSlice = createSlice({
  name: "reactBoard",
  initialState,
  reducers: {
    addReactResource: (state, action) => {
      state.reactResources.push(action.payload);
    },
    updateReactLike: (state, action) => {
      const item = state.reactResources.find(
        resource => resource.id === action.payload
      );
      if (item) {
        item.likes += 1;
      }
    },
  },
});

export const { addReactResource, updateReactLike } = reactBoardSlice.actions;
export default reactBoardSlice.reducer;
