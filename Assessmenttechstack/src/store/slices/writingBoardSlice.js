// src/store/slices/writingBoardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "writing";

// Load resources from MongoDB
export const fetchWritingResources = createAsyncThunk(
  "writingBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch writing resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create resource in MongoDB
export const createWritingResource = createAsyncThunk(
  "writingBoard/createResource",
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
      if (!res.ok) return rejectWithValue(data.message || "Failed to create writing resource");

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
export const likeWritingResource = createAsyncThunk(
  "writingBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like writing resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  writingResources: [],
  status: "idle",
  error: null
};

const writingBoardSlice = createSlice({
  name: "writingBoard",
  initialState,
  reducers: {
    clearWritingResources: (state) => {
      state.writingResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchWritingResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWritingResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.writingResources = action.payload;
      })
      .addCase(fetchWritingResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createWritingResource.fulfilled, (state, action) => {
        state.writingResources.unshift(action.payload);
      })
      .addCase(createWritingResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeWritingResource.fulfilled, (state, action) => {
        const r = state.writingResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeWritingResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearWritingResources } = writingBoardSlice.actions;
export default writingBoardSlice.reducer;
