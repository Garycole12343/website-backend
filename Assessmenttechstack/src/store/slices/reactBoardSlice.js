// src/store/slices/reactBoardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "react";

// Load resources from MongoDB
export const fetchReactResources = createAsyncThunk(
  "reactBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch React resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create resource in MongoDB
export const createReactResource = createAsyncThunk(
  "reactBoard/createResource",
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
      if (!res.ok) return rejectWithValue(data.message || "Failed to create React resource");

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

// Like resource in MongoDB
export const likeReactResource = createAsyncThunk(
  "reactBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like React resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  reactResources: [],
  status: "idle",
  error: null
};

const reactBoardSlice = createSlice({
  name: "reactBoard",
  initialState,
  reducers: {
    clearReactResources: (state) => {
      state.reactResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchReactResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReactResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reactResources = action.payload;
      })
      .addCase(fetchReactResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createReactResource.fulfilled, (state, action) => {
        state.reactResources.unshift(action.payload);
      })
      .addCase(createReactResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeReactResource.fulfilled, (state, action) => {
        const r = state.reactResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeReactResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearReactResources } = reactBoardSlice.actions;
export default reactBoardSlice.reducer;
