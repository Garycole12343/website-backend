// src/store/slices/aiToolsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("aiToolsBoard") || {
  aiToolsResources: [],
};

const aiToolsSlice = createSlice({
  name: "aiToolsBoard",
  initialState,
  reducers: {
    addAiToolsResource: (state, action) => {
      state.aiToolsResources.push(action.payload);
    },
    updateAiToolsLike: (state, action) => {
      const resource = state.aiToolsResources.find(r => r.id === action.payload);
      if (resource) resource.likes += 1;
    },
  },
});

export const { addAiToolsResource, updateAiToolsLike } = aiToolsSlice.actions;
export default aiToolsSlice.reducer;
