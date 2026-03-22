import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  javascriptResources: [],
  reactResources: [],
  codingResources: [],
  artResources: [],
  musicResources: [],
  writingResources: [],
  designResources: [],
  photographyResources: [],
  cookingResources: [],
  aiToolsResources: [],
};

const resourceSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    addResource: (state, action) => {
      const { category, resource } = action.payload;
      if (state[category]) {
        state[category].push({ id: Date.now(), ...resource });
      }
    },
    addJavascriptResource: (state, action) => {
      state.javascriptResources.push({ id: Date.now(), ...action.payload });
    },
    addReactResource: (state, action) => {
      state.reactResources.push({ id: Date.now(), ...action.payload });
    },
    addCodingResource: (state, action) => {
      state.codingResources.push({ id: Date.now(), ...action.payload });
    },
    addArtResource: (state, action) => {
      state.artResources.push({ id: Date.now(), ...action.payload });
    },
    addMusicResource: (state, action) => {
      state.musicResources.push({ id: Date.now(), ...action.payload });
    },
    addWritingResource: (state, action) => {
      state.writingResources.push({ id: Date.now(), ...action.payload });
    },
    addDesignResource: (state, action) => {
      state.designResources.push({ id: Date.now(), ...action.payload });
    },
    addPhotographyResource: (state, action) => {
      state.photographyResources.push({ id: Date.now(), ...action.payload });
    },
    addCookingResource: (state, action) => {
      state.cookingResources.push({ id: Date.now(), ...action.payload });
    },
    addAiToolsResource: (state, action) => {
      state.aiToolsResources.push({ id: Date.now(), ...action.payload });
    },
    // Add the new reducer for updating likes
    updateAiToolsLike: (state, action) => {
      state.aiToolsResources = state.aiToolsResources.map(idea =>
        idea.id === action.payload ? { ...idea, likes: idea.likes + 1 } : idea
      );
    },
  },
});

export const {
  addResource,
  addJavascriptResource,
  addReactResource,
  addCodingResource,
  addArtResource,
  addMusicResource,
  addWritingResource,
  addDesignResource,
  addPhotographyResource,
  addCookingResource,
  addAiToolsResource,
  updateAiToolsLike,
} = resourceSlice.actions;

export default resourceSlice.reducer;
