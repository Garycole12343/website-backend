// src/store/slices/aiToolsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/**
 * Category key used in MongoDB for this board.
 * Must match what your SkillsPage expects and what you store in Mongo.
 */
const CATEGORY = "ai-tools";

// 1) Load resources from MongoDB
export const fetchAiToolsResources = createAsyncThunk(
  "aiToolsBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch AI Tools resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// 2) Create a resource in MongoDB
export const createAiToolsResource = createAsyncThunk(
  "aiToolsBoard/createResource",
  async ({ title, description = "", link = "", ownerEmail, ownerName = "" }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          link,
          category: CATEGORY,
          ownerEmail,
          ownerName
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to create resource");

      // We need the created item in state.
      // Backend returns { id }, so we build the object locally.
      return {
        id: data.id,
        title,
        description,
        link,
        category: CATEGORY,
        ownerEmail,
        ownerName,
        likes: 0
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// 3) Like a resource in MongoDB
export const likeAiToolsResource = createAsyncThunk(
  "aiToolsBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  aiToolsResources: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null
};

const aiToolsSlice = createSlice({
  name: "aiToolsBoard",
  initialState,
  reducers: {
    // Optional: if you want a local-only reset button
    clearAiToolsResources: (state) => {
      state.aiToolsResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAiToolsResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAiToolsResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.aiToolsResources = action.payload;
      })
      .addCase(fetchAiToolsResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createAiToolsResource.fulfilled, (state, action) => {
        // Put newest at top to match backend sorting
        state.aiToolsResources.unshift(action.payload);
      })
      .addCase(createAiToolsResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeAiToolsResource.fulfilled, (state, action) => {
        const r = state.aiToolsResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeAiToolsResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearAiToolsResources } = aiToolsSlice.actions;
export default aiToolsSlice.reducer;
