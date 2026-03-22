// src/store/slices/javaScriptSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("javascriptBoard") || { javascriptResources: [] };

const javaScriptSlice = createSlice({
  name: "javascriptBoard",
  initialState,
  reducers: {
    addJavascriptResource: (state, action) => {
      state.javascriptResources.push(action.payload);
    },
    updateJavascriptLike: (state, action) => {
      const item = state.javascriptResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addJavascriptResource, updateJavascriptLike } = javaScriptSlice.actions;
export default javaScriptSlice.reducer;
