// src/store/slices/musicBoardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadState } from "../localStorage";

const initialState = loadState("musicBoard") || { musicResources: [] };

const musicBoardSlice = createSlice({
  name: "musicBoard",
  initialState,
  reducers: {
    addMusicResource: (state, action) => {
      state.musicResources.push(action.payload);
    },
    updateMusicResourceLike: (state, action) => {
      const item = state.musicResources.find(i => i.id === action.payload);
      if (item) item.likes += 1;
    },
  },
});

export const { addMusicResource, updateMusicResourceLike } = musicBoardSlice.actions;
export default musicBoardSlice.reducer;
