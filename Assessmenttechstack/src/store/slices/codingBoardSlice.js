// src/store/slices/codingBoardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const CATEGORY = "coding";

// Load resources from MongoDB
export const fetchCodingResources = createAsyncThunk(
  "codingBoard/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources?category=${encodeURIComponent(CATEGORY)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch coding resources");
      return data.resources || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

// Create a resource in MongoDB
export const createCodingResource = createAsyncThunk(
  "codingBoard/createResource",
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
      if (!res.ok) return rejectWithValue(data.message || "Failed to create coding resource");

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
export const likeCodingResource = createAsyncThunk(
  "codingBoard/likeResource",
  async ({ id, currentLikes }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: (currentLikes ?? 0) + 1 })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return rejectWithValue(data.message || "Failed to like coding resource");

      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Network error");
    }
  }
);

const initialState = {
  codingResources: [],
  status: "idle",
  error: null
};

const codingBoardSlice = createSlice({
  name: "codingBoard",
  initialState,
  reducers: {
    clearCodingResources: (state) => {
      state.codingResources = [];
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCodingResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCodingResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.codingResources = action.payload;
      })
      .addCase(fetchCodingResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load";
      })

      // create
      .addCase(createCodingResource.fulfilled, (state, action) => {
        state.codingResources.unshift(action.payload);
      })
      .addCase(createCodingResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to create";
      })

      // like
      .addCase(likeCodingResource.fulfilled, (state, action) => {
        const r = state.codingResources.find((x) => x.id === action.payload.id);
        if (r) r.likes = (r.likes || 0) + 1;
      })
      .addCase(likeCodingResource.rejected, (state, action) => {
        state.error = action.payload || "Failed to like";
      });
  }
});

export const { clearCodingResources } = codingBoardSlice.actions;
export default codingBoardSlice.reducer;
