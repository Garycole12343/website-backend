// src/store/slices/artBoardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "art";

// Load resources from MongoDB
export const fetchArtResources = createAsyncThunk(
  "artBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch art resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create a resource in MongoDB
export const createArtResource = createAsyncThunk(
  "artBoard/createResource",
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
      if (!res.ok) return rejectWithValue(data.message || "Failed to create art resource");

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

// Like a resource in MongoDB
export const likeArtResource = createAsyncThunk(
  "artBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like art resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  artResources: [],
  status: "idle",
  error: null
};

const artBoardSlice = createSlice({
  name: "artBoard",
  initialState,
  reducers: {
    clearArtResources: (state) => {
      state.artResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchArtResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchArtResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.artResources = action.payload;
      })
      .addCase(fetchArtResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createArtResource.fulfilled, (state, action) => {
        state.artResources.unshift(action.payload);
      })
      .addCase(createArtResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeArtResource.fulfilled, (state, action) => {
        const r = state.artResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeArtResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearArtResources } = artBoardSlice.actions;
export default artBoardSlice.reducer;
