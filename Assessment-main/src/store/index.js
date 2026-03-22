import { configureStore } from "@reduxjs/toolkit";

// data slice (shared, but separated per board)
import resourceReducer from "./resourceSlice";

// per-board UI slices
import reactBoardReducer from "./slices/reactBoardSlice";
import javascriptBoardReducer from "./slices/javaScriptSlice";
import codingBoardReducer from "./slices/codingBoardSlice";
import artBoardReducer from "./slices/artBoardSlice";
import musicBoardReducer from "./slices/musicBoardSlice";
import writingBoardReducer from "./slices/writingBoardSlice";
import designBoardReducer from "./slices/designBoardSlice";
import photographyBoardReducer from "./slices/photographySlice";
import cookingBoardReducer from "./slices/cookingBoardSlice";
import aiToolsBoardReducer from "./slices/aiToolsSlice";

// messages slice
import messagesReducer from "./slices/messagesSlice";

export const store = configureStore({
  reducer: {
    // one shared slice that holds separate arrays:
    // javascriptResources, reactResources, codingResources, etc.
    resources: resourceReducer,

    // per-board UI state
    reactBoard: reactBoardReducer,
    javascriptBoard: javascriptBoardReducer,
    codingBoard: codingBoardReducer,
    artBoard: artBoardReducer,
    musicBoard: musicBoardReducer,
    writingBoard: writingBoardReducer,
    designBoard: designBoardReducer,
    photographyBoard: photographyBoardReducer,
    cookingBoard: cookingBoardReducer,
    aiToolsBoard: aiToolsBoardReducer,

    // messages slice
    messages: messagesReducer,
  },
});

export default store;
